import { RULES } from '../configs/fieldMap.config';

/**
 * Repeat IMEI Rule — Skill Score
 *
 * Ported from app.py `load_and_process_data()`:
 *   imei_counts = df_filtered['IMEI'].value_counts()
 *   repeat_imeis = imei_counts[imei_counts > 1].index
 *   df_filtered['Flag_Repeat_IMEI'] = df_filtered['IMEI'].isin(repeat_imeis)
 *   df_filtered['Skill_Penalty'] = df_filtered['Flag_Repeat_IMEI'].astype(int) * 20
 *
 * Key: this rule requires GLOBAL context (all rows) to compute frequencies.
 * The engine passes the full dataset; this rule pre-computes counts and
 * returns a per-row result map.
 */

export interface RepeatImeiResult {
  flagged: boolean;
  penalty: number;
  evidence: {
    imei: string;
    count: number;
  };
}

/**
 * Runs the Repeat IMEI rule across all rows.
 * Returns a Map keyed by row index → result.
 *
 * @param imeis - Array of IMEI values (one per row, same order as input rows)
 */
export function runRepeatImeiRule(imeis: (string | null | undefined)[]): Map<number, RepeatImeiResult> {
  // Count frequency of each IMEI across all rows
  const counts = new Map<string, number>();
  for (const imei of imeis) {
    if (!imei) continue;
    counts.set(imei, (counts.get(imei) ?? 0) + 1);
  }

  // Flag rows where IMEI count exceeds threshold
  const results = new Map<number, RepeatImeiResult>();
  imeis.forEach((imei, i) => {
    const count = imei ? (counts.get(imei) ?? 0) : 0;
    const flagged = count > RULES.repeatImei.threshold;
    results.set(i, {
      flagged,
      penalty: flagged ? RULES.repeatImei.penalty : 0,
      evidence: { imei: imei ?? '', count },
    });
  });

  return results;
}
