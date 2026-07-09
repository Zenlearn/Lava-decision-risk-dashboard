/**
 * Field Map Configuration — Lava Decision Risk
 *
 * Maps logical field names to the ACTUAL column names in the uploaded CSV/XLSX.
 * When Lava's data team renames columns, only this file changes — no other code touches column names.
 *
 * Source of truth: 'Master Data last 3 Months copy.xlsx', sheet 'Master Data working'
 * Inspected: 2026-07-09, 37,736 rows, 41 columns.
 *
 * Rule thresholds are also here so they stay alongside the field definitions they reference.
 * Changing a threshold means changing one number in one place.
 */

// ─── Column name mapping ──────────────────────────────────────────────────────
export const FIELD_MAP = {
  // Scoring rule fields (required by rule engine)
  month:        'Month',
  imei:         'IMEI',
  phone:        'Customer Contact Number1',
  npsRating:    'Final NPS Rating',

  // Org hierarchy (used to upsert Region → Dealer → ServiceCentre)
  busmCode:     'BUSM Code',
  busmName:     'BUSM Name',
  asmCode:      'ASM Code',
  asmName:      'ASM Name',
  aspName:      'ASP Name',
  serviceCentreId: 'Service Centre ID',

  // Display fields (stored in WorkOrder.rawData, surfaced on hit list)
  workorder:    'Workorder',
  customerCity: 'Customer City',
  symptomDesc:  'Symptom Desc',
  model:        'Model',
  callType:     'Call Type',
  callCategory: 'Call Category',
  customerName: 'Customer Name1',
  deliveryDate: 'Delivery Date',
  creationDate: 'Creation Date',
} as const;

export type FieldMapKey = keyof typeof FIELD_MAP;

// ─── Month filter ─────────────────────────────────────────────────────────────
// Set to null to accept ALL months in the file (recommended — which 3 months
// are "current" changes each upload). Set to a string array to filter to
// specific months, e.g. ['Feb', 'Mar', 'Apr'].
//
// app.py filtered to ['Feb', 'Mar', 'Apr'] but the actual file now includes May.
// Default: null (accept all) — the user uploads "last 3 months" manually.
export const TARGET_MONTHS: string[] | null = ['Feb', 'Mar', 'Apr'];

// ─── Rule thresholds (must match app.py exactly until explicitly updated) ─────
export const RULES = {
  repeatImei: {
    // Flag an IMEI if it appears MORE THAN this many times in the dataset
    threshold: 1,        // > 1 → flagged (same as app.py: value_counts > 1)
    penalty:   20,       // Skill_Score deduction
  },
  suspiciousPhone: {
    // Flag a phone number if it appears MORE THAN this many times
    threshold: 2,        // > 2 → flagged (same as app.py: value_counts > 2)
    penalty:   30,       // Audit_Score deduction
  },
  processBreakdown: {
    // NPS ratings that indicate a broken process
    // app.py: isin(['No Response', '1', '2', '3'])
    // Actual data: integer values (1–5) OR string 'No Response'
    // Rule: No Response OR numeric rating <= 3 → flagged
    noResponseString: 'No Response',
    maxDetractorScore: 3,  // ratings 1, 2, 3 are detractors
    penalty: 15,           // Process_Score deduction
  },
  hitList: {
    // Records with this many or more anomalies appear on the audit hit list
    minAnomalies: 2,     // >= 2 → hit list (same as app.py)
  },
  scoreBaseline: 100,    // All scores start at 100, clipped at 0
} as const;
