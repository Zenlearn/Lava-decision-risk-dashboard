import { Prisma } from '@prisma/client';
import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';
import { FIELD_MAP } from '../configs/fieldMap.config';
import { toNumber } from '../utils/fileParser.util';
import { markCrossAspRows, computeAspMonthRollup } from '../rules/engine';
import { MasterDataRuleRow, SparePriceLookup, AspMonthRollupResult } from '../rules/types';

/**
 * Recomputes AspMetricRollup — the single source of truth for dashboard reads.
 * Run after each import batch completes (any of the 6 dataset types), scoped
 * to only the (serviceCentreId, month) pairs that import touched — NOT a full
 * table recompute.
 *
 * Cross-ASP-IMEI detection needs visibility across ALL ASPs for a given month
 * (an IMEI serviced at 2 different ASPs), so this loads every WorkOrder for
 * each AFFECTED MONTH (not just the touched ASPs) to compute that flag
 * correctly, then writes rollups only for the requested (serviceCentreId, month)
 * pairs.
 *
 * PERFORMANCE: the original version issued 5 findMany + 1 upsert PER TOUCHED
 * ASP (~1,400 ASPs × 3 months × 6 queries ≈ 25,000 sequential round trips —
 * measured at 132 minutes for one Master Data import). This version batches
 * each of the 5 lookups to ONE query per month (using `serviceCentreId IN (...)`,
 * grouped in-memory afterward) and writes all of a month's rollups in a single
 * multi-row `INSERT ... ON CONFLICT DO UPDATE` — turning ~25,000 round trips
 * into roughly 6 per month.
 */


function workOrderToRuleRow(wo: { rawData: unknown }, rowIndex: number): Omit<MasterDataRuleRow, 'isCrossAsp'> {
  const raw = wo.rawData as Record<string, unknown>;
  return {
    rowIndex,
    imei: (raw[FIELD_MAP.imei] as string) ?? null,
    phone: (raw[FIELD_MAP.phone] as string) ?? null,
    doaType: (raw[FIELD_MAP.doaType] as string) ?? null,
    actionDesc: (raw[FIELD_MAP.actionDesc] as string) ?? null,
    symptomDesc: (raw[FIELD_MAP.symptomDesc] as string) ?? null,
    callType: (raw[FIELD_MAP.callType] as string) ?? null,
    callCategory: (raw[FIELD_MAP.callCategory] as string) ?? null,
    creationDate: (raw[FIELD_MAP.creationDate] as string) ?? null,
    deliveryDate: (raw[FIELD_MAP.deliveryDate] as string) ?? null,
    pcbaConsumption: toNumber(raw[FIELD_MAP.pcbaConsumption]),
    tpLcdConsumption: toNumber(raw[FIELD_MAP.tpLcdConsumption]),
    batteryConsumption: toNumber(raw[FIELD_MAP.batteryConsumption]),
    subPcbaConsumption: toNumber(raw[FIELD_MAP.subPcbaConsumption]),
    accessoriesConsumption: toNumber(raw[FIELD_MAP.accessoriesConsumption]),
    othersConsumption: toNumber(raw[FIELD_MAP.othersConsumption]),
    totalPartValue: toNumber(raw[FIELD_MAP.totalPartValue]),
    handsetValue: toNumber(raw[FIELD_MAP.handsetValue]),
  };
}

async function buildSparePriceLookup(): Promise<SparePriceLookup> {
  const catalog = await prisma.sparePriceCatalog.findMany({
    select: { materialCode: true, basicPrice: true, distributorPrice: true },
  });
  const byCode = new Map(catalog.map((c) => [c.materialCode, { basicPrice: c.basicPrice, distributorPrice: c.distributorPrice }]));
  return (materialCode: string) => byCode.get(materialCode);
}

/** Groups an array of records (each carrying serviceCentreId) into a Map keyed by that id. */
function groupByServiceCentre<T extends { serviceCentreId: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    if (!map.has(row.serviceCentreId)) map.set(row.serviceCentreId, []);
    map.get(row.serviceCentreId)!.push(row);
  }
  return map;
}

/** Writes a batch of computed rollups in ONE multi-row upsert statement. */
async function writeRollupBatch(rollups: AspMonthRollupResult[]): Promise<void> {
  if (rollups.length === 0) return;

  const rows = rollups.map((r) =>
    Prisma.sql`(
      gen_random_uuid(), ${r.serviceCentreId}, ${r.month},
      ${r.ftfr}, ${r.csat}, ${r.mttr}, ${r.diag}, ${r.leak},
      ${r.skillScore}, ${r.auditScore}, ${r.processScore},
      ${JSON.stringify(r.childMetrics)}::jsonb, now()
    )`
  );

  await prisma.$executeRaw`
    INSERT INTO "AspMetricRollup"
      (id, "serviceCentreId", month, ftfr, csat, mttr, diag, leak,
       "skillScore", "auditScore", "processScore", "childMetrics", "computedAt")
    VALUES ${Prisma.join(rows)}
    ON CONFLICT ("serviceCentreId", month) DO UPDATE SET
      ftfr = EXCLUDED.ftfr,
      csat = EXCLUDED.csat,
      mttr = EXCLUDED.mttr,
      diag = EXCLUDED.diag,
      leak = EXCLUDED.leak,
      "skillScore" = EXCLUDED."skillScore",
      "auditScore" = EXCLUDED."auditScore",
      "processScore" = EXCLUDED."processScore",
      "childMetrics" = EXCLUDED."childMetrics",
      "computedAt" = EXCLUDED."computedAt"
  `;
}

/** All distinct serviceCentreIds that currently have ANY record for a month, across the 6 source tables. */
async function serviceCentreIdsWithDataForMonth(month: string): Promise<string[]> {
  const [wo, qc, els, def, sah, msm] = await Promise.all([
    prisma.workOrder.findMany({ where: { month }, select: { serviceCentreId: true }, distinct: ['serviceCentreId'] }),
    prisma.complianceQcRecord.findMany({ where: { month }, select: { serviceCentreId: true }, distinct: ['serviceCentreId'] }),
    prisma.complianceElsDoaRecord.findMany({ where: { month }, select: { serviceCentreId: true }, distinct: ['serviceCentreId'] }),
    prisma.complianceDefectiveSpareRecord.findMany({ where: { month }, select: { serviceCentreId: true }, distinct: ['serviceCentreId'] }),
    prisma.serviceAtHomeAppointment.findMany({ where: { month }, select: { serviceCentreId: true }, distinct: ['serviceCentreId'] }),
    prisma.msmDailyRecord.findMany({ where: { month }, select: { serviceCentreId: true }, distinct: ['serviceCentreId'] }),
  ]);
  const set = new Set<string>();
  for (const list of [wo, qc, els, def, sah, msm]) for (const r of list) set.add(r.serviceCentreId);
  return Array.from(set);
}

/**
 * Fully rebuilds AspMetricRollup for the given months. For each month it:
 *   1. deletes ALL existing rollups for that month,
 *   2. gathers every ASP that currently has data for that month (across all 6
 *      source tables), and
 *   3. recomputes each from current state.
 *
 * Full-rebuild (not upsert-only) is deliberate: under delete-then-replace
 * imports, an ASP present in a month's old data may be absent from the new
 * upload. Upsert alone would leave that ASP's now-orphaned rollup behind —
 * deleting the month's rollups first guarantees no staleness.
 */
export async function recomputeAspMonthRollups(months: string[]): Promise<void> {
  const uniqueMonths = Array.from(new Set(months)).filter(Boolean);
  if (uniqueMonths.length === 0) return;

  const lookupSparePrice = await buildSparePriceLookup();

  for (const month of uniqueMonths) {
    // 1. Clear this month's rollups — rebuilt fresh from current data below.
    await prisma.aspMetricRollup.deleteMany({ where: { month } });

    // 2. Which ASPs have any data for this month now (post-replace).
    const scIds = await serviceCentreIdsWithDataForMonth(month);
    if (scIds.length === 0) {
      logger.info('Rollup recompute: no data for month, cleared rollups', { month });
      continue;
    }

    // Load ALL workorders for this month (all ASPs) — needed for correct
    // cross-ASP-IMEI detection, which requires global visibility per month.
    const allWorkOrdersThisMonth = await prisma.workOrder.findMany({
      where: { month },
      select: { rawData: true, serviceCentreId: true },
    });

    const rawRows = allWorkOrdersThisMonth.map((wo, i) => workOrderToRuleRow(wo, i));
    const woScIds = allWorkOrdersThisMonth.map((wo) => wo.serviceCentreId);
    const markedRows = markCrossAspRows(rawRows, woScIds);

    const masterRowsByServiceCentre = new Map<string, MasterDataRuleRow[]>();
    markedRows.forEach((row, i) => {
      const scId = woScIds[i]!;
      if (!masterRowsByServiceCentre.has(scId)) masterRowsByServiceCentre.set(scId, []);
      masterRowsByServiceCentre.get(scId)!.push(row);
    });

    // Batch-fetch each of the 5 datasets ONCE for the whole month, across all
    // ASPs with data — not one query per ASP.
    const [qcAll, elsAll, defAll, sahAll, msmAll] = await Promise.all([
      prisma.complianceQcRecord.findMany({
        where: { serviceCentreId: { in: scIds }, month },
        select: { serviceCentreId: true, complianceStatus: true, qcStatus: true },
      }),
      prisma.complianceElsDoaRecord.findMany({
        where: { serviceCentreId: { in: scIds }, month },
        select: { serviceCentreId: true, complianceStatus: true, nonComplianceReason: true, value: true, handsetCategory: true },
      }),
      prisma.complianceDefectiveSpareRecord.findMany({
        where: { serviceCentreId: { in: scIds }, month },
        select: { serviceCentreId: true, complianceStatus: true, amount: true, debitQty: true, partCode: true, category: true },
      }),
      prisma.serviceAtHomeAppointment.findMany({
        where: { serviceCentreId: { in: scIds }, month },
        select: { serviceCentreId: true, appointmentStatus: true, appointmentDate: true },
      }),
      prisma.msmDailyRecord.findMany({
        where: { serviceCentreId: { in: scIds }, month },
        select: { serviceCentreId: true, date: true, complianceStatus: true, balanceValue: true, msmTarget: true },
      }),
    ]);

    const qcByAsp = groupByServiceCentre(qcAll);
    const elsByAsp = groupByServiceCentre(elsAll);
    const defByAsp = groupByServiceCentre(defAll);
    const sahByAsp = groupByServiceCentre(sahAll);
    const msmByAsp = groupByServiceCentre(msmAll);

    // Pure in-memory compute per ASP — cheap, no I/O.
    const rollups: AspMonthRollupResult[] = scIds.map((serviceCentreId) =>
      computeAspMonthRollup({
        serviceCentreId,
        month,
        masterRows: masterRowsByServiceCentre.get(serviceCentreId) ?? [],
        qcRecords: qcByAsp.get(serviceCentreId) ?? [],
        elsRecords: elsByAsp.get(serviceCentreId) ?? [],
        defRecords: defByAsp.get(serviceCentreId) ?? [],
        sahAppointments: sahByAsp.get(serviceCentreId) ?? [],
        msmRecords: msmByAsp.get(serviceCentreId) ?? [],
        lookupSparePrice,
      })
    );

    // Write in chunks so a single statement's parameter count / size stays reasonable.
    const WRITE_BATCH_SIZE = 500;
    for (let start = 0; start < rollups.length; start += WRITE_BATCH_SIZE) {
      await writeRollupBatch(rollups.slice(start, start + WRITE_BATCH_SIZE));
    }

    logger.info('Rollup recompute complete for month', { month, aspCount: scIds.length });
  }
}
