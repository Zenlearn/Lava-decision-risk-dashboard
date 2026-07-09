import { RULES } from '../configs/fieldMap.config';
import { ImportRow } from '../schemas/import.schema';
import { runRepeatImeiRule } from './repeatImei.rule';
import { runSuspiciousPhoneRule } from './suspiciousPhone.rule';
import { runProcessBreakdownRule } from './processBreakdown.rule';

/**
 * Rule Engine — Lava Decision Risk
 *
 * Orchestrates all three scoring rules across the full row dataset.
 * Returns a per-row scored result.
 *
 * Scoring (from app.py, must stay identical):
 *   Skill_Score  = max(0, 100 − Skill_Penalty)   where Skill_Penalty  = 20 if IMEI repeated
 *   Audit_Score  = max(0, 100 − Audit_Penalty)   where Audit_Penalty  = 30 if phone suspicious
 *   Process_Score= max(0, 100 − Process_Penalty) where Process_Penalty = 15 if NPS is detractor
 *   Total_Anomalies = count of triggered flags (0–3)
 *   Hit List = Total_Anomalies >= 2
 */

export interface RowRuleResult {
  rowIndex: number;

  // Scores (0–100)
  skillScore:   number;
  auditScore:   number;
  processScore: number;
  totalAnomalies: number;
  isHitList: boolean;

  // Flags (used to create RiskFlag records)
  flags: {
    repeatImei:       { flagged: boolean; penalty: number; evidence: Record<string, unknown> };
    suspiciousPhone:  { flagged: boolean; penalty: number; evidence: Record<string, unknown> };
    processBreakdown: { flagged: boolean; penalty: number; evidence: Record<string, unknown> };
  };
}

/**
 * Runs all three rules against the full row set.
 * Rules that require global context (IMEI, phone frequency) are computed once
 * across all rows, then applied per-row.
 *
 * @param rows - All validated import rows (after month filtering)
 * @returns Array of RowRuleResult, same length and order as `rows`
 */
export function runRuleEngine(rows: ImportRow[]): RowRuleResult[] {
  // Pre-compute global frequency maps (rules that need full dataset context)
  const imeiResults  = runRepeatImeiRule(rows.map((r) => r.imei));
  const phoneResults = runSuspiciousPhoneRule(rows.map((r) => r.phone ?? null));

  return rows.map((row, i) => {
    const imei  = imeiResults.get(i)!;
    const phone = phoneResults.get(i)!;
    const nps   = runProcessBreakdownRule(row.npsRating as string | number | null | undefined);

    const totalAnomalies = [imei.flagged, phone.flagged, nps.flagged].filter(Boolean).length;

    const skillScore   = Math.max(0, RULES.scoreBaseline - imei.penalty);
    const auditScore   = Math.max(0, RULES.scoreBaseline - phone.penalty);
    const processScore = Math.max(0, RULES.scoreBaseline - nps.penalty);

    return {
      rowIndex: i,
      skillScore,
      auditScore,
      processScore,
      totalAnomalies,
      isHitList: totalAnomalies >= RULES.hitList.minAnomalies,
      flags: {
        repeatImei:       { flagged: imei.flagged,  penalty: imei.penalty,  evidence: imei.evidence as Record<string, unknown> },
        suspiciousPhone:  { flagged: phone.flagged, penalty: phone.penalty, evidence: phone.evidence as Record<string, unknown> },
        processBreakdown: { flagged: nps.flagged,   penalty: nps.penalty,   evidence: nps.evidence as Record<string, unknown> },
      },
    };
  });
}
