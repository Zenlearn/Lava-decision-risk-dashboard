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
  npsRating:    npsRatingSchema, // absent from current file — always undefined until VOC/NPS data returns
  doaType:      z.string().nullable().optional(),
  actionDesc:   z.string().nullable().optional(),

  // Org hierarchy — optional (missing → will be created as 'Unknown').
  // aspCode (Service Centre Code) is the primary hierarchy join key.
  busmName:     z.string().nullable().optional(),
  asmName:      z.string().nullable().optional(),
  aspName:      z.string().nullable().optional(),
  aspCode:      z.union([z.number(), z.string()]).nullable().optional(),

  // Display fields
  workorder:    z.union([z.number(), z.string()]).nullable().optional(),
  symptomDesc:  z.string().nullable().optional(),
  model:        z.string().nullable().optional(),
  modelType:    z.string().nullable().optional(),
  callType:     z.string().nullable().optional(),
  callCategory: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  deliveryDate: z.union([z.date(), z.string()]).nullable().optional(),
  creationDate: z.union([z.date(), z.string()]).nullable().optional(),
  warranty:     z.string().nullable().optional(),

  // Skill Score inputs — part consumption/value breakdown ("CPC data")
  pcbaConsumption:        z.union([z.number(), z.string()]).nullable().optional(),
  pcbaValue:              z.union([z.number(), z.string()]).nullable().optional(),
  tpLcdConsumption:       z.union([z.number(), z.string()]).nullable().optional(),
  tpLcdValue:             z.union([z.number(), z.string()]).nullable().optional(),
  batteryConsumption:     z.union([z.number(), z.string()]).nullable().optional(),
  batteryValue:           z.union([z.number(), z.string()]).nullable().optional(),
  subPcbaConsumption:     z.union([z.number(), z.string()]).nullable().optional(),
  subPcbaValue:           z.union([z.number(), z.string()]).nullable().optional(),
  accessoriesConsumption: z.union([z.number(), z.string()]).nullable().optional(),
  accessoriesValue:       z.union([z.number(), z.string()]).nullable().optional(),
  othersConsumption:      z.union([z.number(), z.string()]).nullable().optional(),
  othersValue:            z.union([z.number(), z.string()]).nullable().optional(),
  handsetValue:           z.union([z.number(), z.string()]).nullable().optional(),
  totalPartValue:         z.union([z.number(), z.string()]).nullable().optional(),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

/** Result of validating a single raw row */
export interface RowValidationResult {
  rowIndex: number;
  valid: boolean;
  data?: ImportRow;
  errors?: string[];
}
