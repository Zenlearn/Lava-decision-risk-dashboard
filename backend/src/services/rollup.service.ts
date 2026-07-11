import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';
import { FIELD_MAP } from '../configs/fieldMap.config';
import { toNumber } from '../utils/fileParser.util';
import { markCrossAspRows, computeAspMonthRollup } from '../rules/engine';
import { MasterDataRuleRow, SparePriceLookup } from '../rules/types';

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

export async function recomputeAspMonthRollups(pairs: AspMonthKey[]): Promise<void> {
  if (pairs.length === 0) return;

  const uniquePairs = Array.from(new Map(pairs.map((p) => [`${p.serviceCentreId}::${p.month}`, p])).values());
  const monthsAffected = Array.from(new Set(uniquePairs.map((p) => p.month)));
  const lookupSparePrice = await buildSparePriceLookup();

  for (const month of monthsAffected) {
    const touchedForMonth = uniquePairs.filter((p) => p.month === month);
    const touchedScIds = new Set(touchedForMonth.map((p) => p.serviceCentreId));

    // Load ALL workorders for this month (all ASPs) — needed for correct
    // cross-ASP-IMEI detection, which requires global visibility per month.
    const allWorkOrdersThisMonth = await prisma.workOrder.findMany({
      where: { month },
      select: { rawData: true, serviceCentreId: true },
    });

    const rawRows = allWorkOrdersThisMonth.map((wo, i) => workOrderToRuleRow(wo, i));
    const scIds = allWorkOrdersThisMonth.map((wo) => wo.serviceCentreId);
    const markedRows = markCrossAspRows(rawRows, scIds);

    const rowsByServiceCentre = new Map<string, MasterDataRuleRow[]>();
    markedRows.forEach((row, i) => {
      const scId = scIds[i]!;
      if (!touchedScIds.has(scId)) return; // only recompute rollups we were asked to
      if (!rowsByServiceCentre.has(scId)) rowsByServiceCentre.set(scId, []);
      rowsByServiceCentre.get(scId)!.push(row);
    });

    for (const serviceCentreId of touchedScIds) {
      const masterRows = rowsByServiceCentre.get(serviceCentreId) ?? [];

      const [qcRecords, elsRecords, defRecords, sahAppointments, msmRecords] = await Promise.all([
        prisma.complianceQcRecord.findMany({
          where: { serviceCentreId, month },
          select: { complianceStatus: true, qcStatus: true },
        }),
        prisma.complianceElsDoaRecord.findMany({
          where: { serviceCentreId, month },
          select: { complianceStatus: true, nonComplianceReason: true, value: true, handsetCategory: true },
        }),
        prisma.complianceDefectiveSpareRecord.findMany({
          where: { serviceCentreId, month },
          select: { complianceStatus: true, amount: true, debitQty: true, partCode: true, category: true },
        }),
        prisma.serviceAtHomeAppointment.findMany({
          where: { serviceCentreId, month },
          select: { appointmentStatus: true, appointmentDate: true },
        }),
        prisma.msmDailyRecord.findMany({
          where: { serviceCentreId, month },
          select: { date: true, complianceStatus: true, balanceValue: true, msmTarget: true },
        }),
      ]);

      const rollup = computeAspMonthRollup({
        serviceCentreId,
        month,
        masterRows,
        qcRecords,
        elsRecords,
        defRecords,
        sahAppointments,
        msmRecords,
        lookupSparePrice,
      });

      await prisma.aspMetricRollup.upsert({
        where: { serviceCentreId_month: { serviceCentreId, month } },
        create: {
          serviceCentreId,
          month,
          ftfr: rollup.ftfr,
          csat: rollup.csat,
          mttr: rollup.mttr,
          diag: rollup.diag,
          leak: rollup.leak,
          skillScore: rollup.skillScore,
          auditScore: rollup.auditScore,
          processScore: rollup.processScore,
          childMetrics: rollup.childMetrics as object,
        },
        update: {
          ftfr: rollup.ftfr,
          csat: rollup.csat,
          mttr: rollup.mttr,
          diag: rollup.diag,
          leak: rollup.leak,
          skillScore: rollup.skillScore,
          auditScore: rollup.auditScore,
          processScore: rollup.processScore,
          childMetrics: rollup.childMetrics as object,
          computedAt: new Date(),
        },
      });
    }

    logger.info('Rollup recompute complete for month', { month, aspCount: touchedScIds.size });
  }
}
