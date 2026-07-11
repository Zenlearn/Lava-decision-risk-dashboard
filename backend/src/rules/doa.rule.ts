import { RULES } from '../configs/fieldMap.config';

/**
 * DOA Rule — Skill Score
 *
 * New rule (not in app.py) — the Jul 2026 data drop added a `DOA Type` column
 * to Master Data. A non-empty DOA Type means the workorder was reported as
 * Dead-On-Arrival — a technical/manufacturing-quality signal that belongs
 * alongside Repeat IMEI under the Skill category (both measure "was this
 * actually fixed / genuinely faulty", not fraud or process discipline).
 *
 * This is a per-row rule (no global context needed) — unlike Repeat IMEI /
 * Suspicious Phone, DOA status is intrinsic to the row itself.
 */

export interface DoaResult {
  flagged: boolean;
  penalty: number;
  evidence: {
    doaType: string | null;
  };
}

export function runDoaRule(doaType: string | null | undefined): DoaResult {
  const flagged = doaType !== null && doaType !== undefined && String(doaType).trim() !== '';
  return {
    flagged,
    penalty: flagged ? RULES.doa.penalty : 0,
    evidence: { doaType: doaType ?? null },
  };
}
