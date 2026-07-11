import { RULES } from '../configs/fieldMap.config';
import { runRepeatImeiRule } from './repeatImei.rule';
import { runSuspiciousPhoneRule } from './suspiciousPhone.rule';
import { runDoaRule } from './doa.rule';
import { computeSkillAggregate } from './skillAggregate.rule';
import { computeAuditAggregate } from './auditAggregate.rule';
import { computeProcessAggregate } from './processAggregate.rule';
import { computeExecTiles } from './execTiles.rule';
import { MasterDataRuleRow, RowRuleResult, AspMonthRuleInput, AspMonthRollupResult } from './types';

/**
 * Rule Engine — Lava Decision Risk
 *
 * Two entry points:
 *
 * 1. runRuleEngine(rows) — ROW-LEVEL, for one WorkOrder at a time.
 *    Produces the Skill flags (Repeat IMEI + DOA — Master-Data-only, per
 *    Rohit's "CPC data" framing) plus the standalone Suspicious Phone flag.
 *    Feeds RiskFlag / hit-list / Total_Anomalies exactly as before this rebuild.
 *
 *    NOTE on Suspicious Phone: the old 3-rule engine folded this into "Audit."
 *    The new Audit definition is explicitly compliance-parameter-based (SRN,
 *    DOA audit, defective spares, VOC) and doesn't mention customer phone-reuse
 *    fraud. Suspicious Phone is kept as a standalone hit-list signal — it does
 *    NOT feed skillScore, auditScore, or processScore in the new model. Flag
 *    this for Rohit to confirm it shouldn't be re-homed somewhere.
 *
 * 2. computeAspMonthRollup(input) — ASP-MONTH AGGREGATE, run after each import
 *    batch completes. Produces the AspMetricRollup row: the 5 Executive
 *    Dashboard tiles + 3 category scores + deep-dive child metrics, joining
 *    ALL 6 datasets by (serviceCentreId, month). This REPLACES the old pattern
 *    of dashboard.service.ts recomputing everything live from WorkOrder.rawData
 *    on every request.
 */

export function runRuleEngine(rows: MasterDataRuleRow[]): RowRuleResult[] {
  const imeiResults  = runRepeatImeiRule(rows.map((r) => r.imei));
  const phoneResults = runSuspiciousPhoneRule(rows.map((r) => r.phone));

  return rows.map((row, i) => {
    const imei  = imeiResults.get(i)!;
    const phone = phoneResults.get(i)!;
    const doa   = runDoaRule(row.doaType);

    const totalAnomalies = [imei.flagged, doa.flagged, phone.flagged].filter(Boolean).length;
    const skillPenalty = imei.penalty + doa.penalty;

    return {
      rowIndex: row.rowIndex,
      skillPenalty,
      totalAnomalies,
      isHitList: totalAnomalies >= RULES.hitList.minAnomalies,
      flags: {
        repeatImei:      { flagged: imei.flagged,  penalty: imei.penalty,  evidence: imei.evidence as Record<string, unknown> },
        doa:             { flagged: doa.flagged,   penalty: doa.penalty,   evidence: doa.evidence as Record<string, unknown> },
        suspiciousPhone: { flagged: phone.flagged, penalty: phone.penalty, evidence: phone.evidence as Record<string, unknown> },
      },
    };
  });
}

/**
 * Marks each row's `isCrossAsp` flag — an IMEI serviced at more than one ASP
 * within the same month. MUST run over ALL ASPs' rows for a month at once
 * (before per-ASP partitioning) since it needs cross-ASP visibility.
 */
export function markCrossAspRows(rows: Omit<MasterDataRuleRow, 'isCrossAsp'>[], serviceCentreIdByRow: string[]): MasterDataRuleRow[] {
  const imeiToAsps = new Map<string, Set<string>>();
  rows.forEach((r, i) => {
    if (!r.imei) return;
    const scId = serviceCentreIdByRow[i]!;
    if (!imeiToAsps.has(r.imei)) imeiToAsps.set(r.imei, new Set());
    imeiToAsps.get(r.imei)!.add(scId);
  });

  return rows.map((r) => ({
    ...r,
    isCrossAsp: r.imei ? (imeiToAsps.get(r.imei)?.size ?? 0) > 1 : false,
  }));
}

export function computeAspMonthRollup(input: AspMonthRuleInput): AspMonthRollupResult {
  const skill = computeSkillAggregate(input.masterRows);
  const audit = computeAuditAggregate(input.qcRecords, input.elsRecords, input.defRecords, input.lookupSparePrice);
  const process = computeProcessAggregate(input.masterRows, input.sahAppointments, input.msmRecords);
  const exec = computeExecTiles(input.masterRows);

  return {
    serviceCentreId: input.serviceCentreId,
    month: input.month,

    ftfr: exec.ftfr,
    csat: null, // dormant — no NPS/VOC data in this drop
    mttr: process.avgTat,
    diag: exec.diag,
    leak: exec.leak,

    skillScore: skill.skillScore,
    auditScore: audit.auditScore,
    processScore: process.processScore,

    childMetrics: {
      skill: {
        repeatImeiRate: skill.repeatImeiRate,
        repeatCountDistribution: skill.repeatCountDistribution,
        doaRate: skill.doaRate,
        partConsumption: skill.partConsumption,
        replacementSchemeRate: skill.replacementSchemeRate,
      },
      audit: {
        srnNonComplianceRate: audit.srnNonComplianceRate,
        qcFailureBreakdown: audit.qcFailureBreakdown,
        elsNonComplianceRate: audit.elsNonComplianceRate,
        elsValueAtRisk: audit.elsValueAtRisk,
        elsReasonBreakdown: audit.elsReasonBreakdown,
        defNonComplianceRate: audit.defNonComplianceRate,
        defDebitValueAtRisk: audit.defDebitValueAtRisk,
        defOverchargeCount: audit.defOverchargeCount,
        defOverchargeValue: audit.defOverchargeValue,
        vocStatus: 'dormant',
      },
      process: {
        avgTat: process.avgTat,
        tatOverThresholdRate: process.tatOverThresholdRate,
        sahAppointmentCount: process.sahAppointmentCount,
        sahCancellationRate: process.sahCancellationRate,
        msmPctAchievement: process.msmPctAchievement,
        msmConsecutiveShortfallDays: process.msmConsecutiveShortfallDays,
      },
      leakage: {
        total: exec.leak,
        subcategories: exec.leakageBreakdown,
      },
    },
  };
}
