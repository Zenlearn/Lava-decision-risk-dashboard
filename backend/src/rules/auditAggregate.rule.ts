import { RULES } from '../configs/fieldMap.config';
import { QcRecordInput, ElsDoaRecordInput, DefectiveSpareRecordInput, SparePriceLookup } from './types';

/**
 * Audit Score aggregate — compliance parameters: SRN (Service Receipt Note —
 * IMEI QC sheet), DOA claim audit (ELS DOA REP), defective/damaged spares
 * (DEF(S+D)). VOC (Voice of Customer) has no source data in this drop and
 * stays dormant, same gap as NPS.
 *
 * Unlike Skill (one row per workorder), these are independent audit datasets —
 * not every workorder has a matching QC/ELS/DEF record, so rates are computed
 * against each dataset's own row count for that ASP-month, not against the
 * Master Data workorder count.
 */

function isNonCompliant(status: string | null): boolean {
  if (!status) return false;
  return status.trim().toLowerCase().startsWith('non');
}

export interface AuditAggregateResult {
  auditScore: number;
  srnNonComplianceRate: number | null;
  qcFailureBreakdown: { faulty: number; qcNotDone: number; completed: number };
  elsNonComplianceRate: number | null;
  elsValueAtRisk: number | null;
  elsReasonBreakdown: Record<string, number>;
  defNonComplianceRate: number | null;
  defDebitValueAtRisk: number | null;
  defOverchargeCount: number;
  defOverchargeValue: number;
}

export function computeAuditAggregate(
  qcRecords: QcRecordInput[],
  elsRecords: ElsDoaRecordInput[],
  defRecords: DefectiveSpareRecordInput[],
  lookupSparePrice: SparePriceLookup
): AuditAggregateResult {
  // SRN — IMEI QC
  const srnNonCompliantCount = qcRecords.filter((r) => isNonCompliant(r.complianceStatus)).length;
  const srnNonComplianceRate = qcRecords.length > 0 ? srnNonCompliantCount / qcRecords.length : null;

  const qcFailureBreakdown = qcRecords.reduce(
    (acc, r) => {
      const status = (r.qcStatus ?? '').trim().toLowerCase();
      if (status === 'faulty') acc.faulty += 1;
      else if (status === 'qc not done') acc.qcNotDone += 1;
      else if (status === 'completed') acc.completed += 1;
      return acc;
    },
    { faulty: 0, qcNotDone: 0, completed: 0 }
  );

  // ELS DOA REP
  const elsNonCompliantRecords = elsRecords.filter((r) => isNonCompliant(r.complianceStatus));
  const elsNonComplianceRate = elsRecords.length > 0 ? elsNonCompliantRecords.length / elsRecords.length : null;
  const elsValueAtRisk = elsNonCompliantRecords.reduce((sum, r) => sum + (r.value ?? 0), 0);

  const elsReasonBreakdown: Record<string, number> = {};
  for (const r of elsNonCompliantRecords) {
    const reason = (r.nonComplianceReason ?? 'Unspecified').trim();
    if (!reason || reason.toLowerCase() === 'compliance') continue;
    elsReasonBreakdown[reason] = (elsReasonBreakdown[reason] ?? 0) + 1;
  }

  // DEF(S+D) — defective/damaged spares
  const defNonCompliantRecords = defRecords.filter((r) => isNonCompliant(r.complianceStatus));
  const defNonComplianceRate = defRecords.length > 0 ? defNonCompliantRecords.length / defRecords.length : null;
  // "Debit value at risk" = value of non-compliant returns not yet recovered from the ASP.
  // NOTE: DEF(S+D) sheet carries Amount per line item but no explicit "recovered" flag —
  // treating the full Amount on non-compliant rows as at-risk until reconciliation data exists.
  const defDebitValueAtRisk = defNonCompliantRecords.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  // SRN-vs-ZPRP price reconciliation — flag DEF(S+D) lines billed above catalog price.
  // Only ~82% of DEF(S+D) part codes match the ZPRP catalog; unmatched codes are skipped
  // (lookupSparePrice returns undefined), not treated as an overcharge.
  let defOverchargeCount = 0;
  let defOverchargeValue = 0;
  for (const r of defRecords) {
    if (!r.partCode || r.amount === null) continue;
    const catalogPrice = lookupSparePrice(r.partCode);
    if (!catalogPrice || catalogPrice.basicPrice === null) continue;
    if (r.amount > catalogPrice.basicPrice) {
      defOverchargeCount += 1;
      defOverchargeValue += r.amount - catalogPrice.basicPrice;
    }
  }

  const auditPenalty =
    (srnNonComplianceRate ?? 0) * RULES.srnNonCompliance.penalty +
    (elsNonComplianceRate ?? 0) * RULES.elsDoaNonCompliance.penalty +
    (defNonComplianceRate ?? 0) * RULES.defectiveSpareNonCompliance.penalty;

  const auditScore = Math.max(0, RULES.scoreBaseline - auditPenalty);

  return {
    auditScore,
    srnNonComplianceRate,
    qcFailureBreakdown,
    elsNonComplianceRate,
    elsValueAtRisk,
    elsReasonBreakdown,
    defNonComplianceRate,
    defDebitValueAtRisk,
    defOverchargeCount,
    defOverchargeValue,
  };
}
