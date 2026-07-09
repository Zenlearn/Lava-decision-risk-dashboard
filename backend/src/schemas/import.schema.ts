import { z } from 'zod';

/**
 * Zod schema for a single row from the imported CSV/XLSX.
 *
 * Applied AFTER column name remapping via FIELD_MAP — so field names here
 * are logical names (e.g. `imei`), not raw spreadsheet column names.
 *
 * Design choices:
 *   - Schema is LENIENT by intent (no .strict()) — the file has 41 columns
 *     and we only care about ~10. Unknown columns are allowed through and
 *     stored in WorkOrder.rawData for auditability.
 *   - Only IMEI and Month are hard-required (needed for rule engine to run).
 *   - NPS rating accepts string | number | null — the actual file has mixed types
 *     (integer 5 for a response, string 'No Response' for non-response).
 *   - Phone number is optional — rows without a phone skip the suspicious-phone rule.
 *
 * Rows that fail this schema are collected as rejections and returned in the
 * import summary — they are NOT silently dropped.
 *
 * Security: .strict() is NOT used here because we intentionally allow extra
 * fields (they are stored as rawData). The rule engine only touches the mapped
 * fields — there is no mass-assignment risk since we never spread row data
 * directly into a DB model.
 */

// NPS rating: the actual file mixes integers (1–5) and strings ('No Response')
const npsRatingSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .optional();

export const ImportRowSchema = z.object({
  // Required for rule engine
  imei:         z.string({ required_error: 'IMEI is required' }).min(1, 'IMEI cannot be empty'),
  month:        z.string({ required_error: 'Month is required' }).min(1, 'Month cannot be empty'),

  // Rule inputs — optional (missing → rule skipped for this row)
  phone:        z.string().nullable().optional(),
  npsRating:    npsRatingSchema,

  // Org hierarchy — optional (missing → will be created as 'Unknown')
  busmCode:     z.string().nullable().optional(),
  busmName:     z.string().nullable().optional(),
  asmCode:      z.string().nullable().optional(),
  asmName:      z.string().nullable().optional(),
  aspName:      z.string().nullable().optional(),
  serviceCentreId: z.union([z.number(), z.string()]).nullable().optional(),

  // Display fields
  workorder:    z.union([z.number(), z.string()]).nullable().optional(),
  customerCity: z.string().nullable().optional(),
  symptomDesc:  z.string().nullable().optional(),
  model:        z.string().nullable().optional(),
  callType:     z.string().nullable().optional(),
  callCategory: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  creationDate: z.union([z.date(), z.string()]).nullable().optional(),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

/** Result of validating a single raw row */
export interface RowValidationResult {
  rowIndex: number;
  valid: boolean;
  data?: ImportRow;
  errors?: string[];
}
