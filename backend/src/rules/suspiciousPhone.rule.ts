import { RULES } from '../configs/fieldMap.config';

/**
 * Suspicious Phone Rule — Audit Score
 *
 * Ported from app.py `load_and_process_data()`:
 *   phone_counts = df_filtered['Customer Contact Number1'].value_counts()
 *   suspicious_phones = phone_counts[phone_counts > 2].index
 *   df_filtered['Flag_Suspicious_Phone'] = df_filtered['Customer Contact Number1'].isin(suspicious_phones)
 *   df_filtered['Audit_Penalty'] = df_filtered['Flag_Suspicious_Phone'].astype(int) * 30
 *
 * Same pattern as RepeatImeiRule — requires global context (all rows).
 */

export interface SuspiciousPhoneResult {
  flagged: boolean;
  penalty: number;
  evidence: {
    phone: string;
    count: number;
  };
}

/**
 * Runs the Suspicious Phone rule across all rows.
 * Returns a Map keyed by row index → result.
 *
 * @param phones - Array of phone values (one per row, same order as input rows)
 */
export function runSuspiciousPhoneRule(phones: (string | null | undefined)[]): Map<number, SuspiciousPhoneResult> {
  // Normalise phone numbers (trim whitespace, convert to string)
  const normalised = phones.map((p) => (p ? String(p).trim() : null));

  // Count frequency of each phone number
  const counts = new Map<string, number>();
  for (const phone of normalised) {
    if (!phone) continue;
    counts.set(phone, (counts.get(phone) ?? 0) + 1);
  }

  // Flag rows where phone count exceeds threshold
  const results = new Map<number, SuspiciousPhoneResult>();
  normalised.forEach((phone, i) => {
    const count = phone ? (counts.get(phone) ?? 0) : 0;
    const flagged = count > RULES.suspiciousPhone.threshold;
    results.set(i, {
      flagged,
      penalty: flagged ? RULES.suspiciousPhone.penalty : 0,
      evidence: { phone: phone ?? '', count },
    });
  });

  return results;
}
