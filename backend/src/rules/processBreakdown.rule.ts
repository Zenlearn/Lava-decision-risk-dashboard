import { RULES } from '../configs/fieldMap.config';

/**
 * Process Breakdown Rule — Process Score
 *
 * Ported from app.py `load_and_process_data()`:
 *   df_filtered['Flag_Process_Breakdown'] = df_filtered['Final NPS Rating'].isin(['No Response', '1', '2', '3'])
 *   df_filtered['Process_Penalty'] = df_filtered['Flag_Process_Breakdown'].astype(int) * 15
 *
 * IMPORTANT adaptation from app.py:
 *   app.py assumed all NPS values were strings ('1', '2', etc.)
 *   The actual data file has MIXED types:
 *     - Integer 1–5 for actual ratings (e.g. 5 = Promoter)
 *     - String 'No Response' for non-responders
 *   This rule handles both cases. The threshold logic is equivalent to app.py:
 *     - 'No Response' → flagged
 *     - Numeric rating ≤ 3 → flagged (Detractors in NPS terminology)
 *     - Numeric rating 4 or 5 → NOT flagged (Passives / Promoters)
 *
 * This is a per-row rule (no global context needed).
 */

export interface ProcessBreakdownResult {
  flagged: boolean;
  penalty: number;
  evidence: {
    npsRating: string | number | null;
    reason: 'no_response' | 'detractor' | 'not_flagged';
  };
}

/**
 * Evaluates the Process Breakdown rule for a single NPS rating value.
 */
export function runProcessBreakdownRule(
  npsRating: string | number | null | undefined
): ProcessBreakdownResult {
  // No Response string → always flagged
  if (
    npsRating === null ||
    npsRating === undefined ||
    String(npsRating).trim() === RULES.processBreakdown.noResponseString
  ) {
    return {
      flagged: true,
      penalty: RULES.processBreakdown.penalty,
      evidence: { npsRating: npsRating ?? null, reason: 'no_response' },
    };
  }

  // Numeric or numeric string rating
  const numericRating =
    typeof npsRating === 'number'
      ? npsRating
      : parseFloat(String(npsRating).trim());

  if (!isNaN(numericRating) && numericRating <= RULES.processBreakdown.maxDetractorScore) {
    return {
      flagged: true,
      penalty: RULES.processBreakdown.penalty,
      evidence: { npsRating, reason: 'detractor' },
    };
  }

  return {
    flagged: false,
    penalty: 0,
    evidence: { npsRating, reason: 'not_flagged' },
  };
}
