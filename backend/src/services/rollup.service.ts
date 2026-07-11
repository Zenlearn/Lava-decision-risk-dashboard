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

export interface AspMonthKey {
  serviceCentreId: string;
  month: string;
}

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

export async function recomputeAspMonthRollups(pairs: AspMonthKey[]): Promise<void> {
  if (pairs.length === 0) return;

  const uniquePairs = Array.from(new Map(pairs.map((p) => [`${p.serviceCentreId}::${p.month}`, p])).values());
  const monthsAffected = Array.from(new Set(uniquePairs.map((p) => p.month)));
  const lookupSparePrice = await buildSparePriceLookup();

  for (const month of monthsAffected) {
    const touchedForMonth = uniquePairs.filter((p) => p.month === month);
    const touchedScIds = Array.from(new Set(touchedForMonth.map((p) => p.serviceCentreId)));

    // Load ALL workorders for this month (all ASPs) — needed for correct
    // cross-ASP-IMEI detection, which requires global visibility per month.
    const allWorkOrdersThisMonth = await prisma.workOrder.findMany({
      where: { month },
      select: { rawData: true, serviceCentreId: true },
    });

    const rawRows = allWorkOrdersThisMonth.map((wo, i) => workOrderToRuleRow(wo, i));
    const scIds = allWorkOrdersThisMonth.map((wo) => wo.serviceCentreId);
    const markedRows = markCrossAspRows(rawRows, scIds);

    const touchedScIdSet = new Set(touchedScIds);
    const masterRowsByServiceCentre = new Map<string, MasterDataRuleRow[]>();
    markedRows.forEach((row, i) => {
      const scId = scIds[i]!;
      if (!touchedScIdSet.has(scId)) return; // only recompute rollups we were asked to
      if (!masterRowsByServiceCentre.has(scId)) masterRowsByServiceCentre.set(scId, []);
      masterRowsByServiceCentre.get(scId)!.push(row);
    });

    // Batch-fetch each of the 5 datasets ONCE for the whole month, across all
    // touched ASPs — not one query per ASP.
    const [qcAll, elsAll, defAll, sahAll, msmAll] = await Promise.all([
      prisma.complianceQcRecord.findMany({
        where: { serviceCentreId: { in: touchedScIds }, month },
        select: { serviceCentreId: true, complianceStatus: true, qcStatus: true },
      }),
      prisma.complianceElsDoaRecord.findMany({
        where: { serviceCentreId: { in: touchedScIds }, month },
        select: { serviceCentreId: true, complianceStatus: true, nonComplianceReason: true, value: true, handsetCategory: true },
      }),
      prisma.complianceDefectiveSpareRecord.findMany({
        where: { serviceCentreId: { in: touchedScIds }, month },
        select: { serviceCentreId: true, complianceStatus: true, amount: true, debitQty: true, partCode: true, category: true },
      }),
      prisma.serviceAtHomeAppointment.findMany({
        where: { serviceCentreId: { in: touchedScIds }, month },
        select: { serviceCentreId: true, appointmentStatus: true, appointmentDate: true },
      }),
      prisma.msmDailyRecord.findMany({
        where: { serviceCentreId: { in: touchedScIds }, month },
        select: { serviceCentreId: true, date: true, complianceStatus: true, balanceValue: true, msmTarget: true },
      }),
    ]);

    const qcByAsp = groupByServiceCentre(qcAll);
    const elsByAsp = groupByServiceCentre(elsAll);
    const defByAsp = groupByServiceCentre(defAll);
    const sahByAsp = groupByServiceCentre(sahAll);
    const msmByAsp = groupByServiceCentre(msmAll);

    // Pure in-memory compute per ASP — cheap, no I/O.
    const rollups: AspMonthRollupResult[] = touchedScIds.map((serviceCentreId) =>
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

    logger.info('Rollup recompute complete for month', { month, aspCount: touchedScIds.length });
  }
}
