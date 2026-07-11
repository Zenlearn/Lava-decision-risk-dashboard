/**
 * Field Map Configuration — Lava Decision Risk
 *
 * Maps logical field names to the ACTUAL column names in each of the 6 uploaded
 * data files. When Lava's data team renames columns, only this file changes —
 * no other code touches spreadsheet column names.
 *
 * Source of truth: '/Data 10 Jul 2026/' drop, inspected 2026-07-10.
 *   - Delivered Master Data Apr to Jun'26.xlsx        107,407 rows, 43 columns
 *   - Compliane and Non-Com audit Data last 3 Months.xlsx
 *       sheet "IMEI QC"      8,840 rows, 50 columns  (SRN — Service Receipt Note reconciliation)
 *       sheet "DEF(S+D)"    25,604 rows, 21 columns  (defective/damaged spare returns)
 *       sheet "ELS DOA REP"  4,872 rows, 27 columns  (DOA claim audit)
 *   - S@H Apr to Jun26.XLSX                           16,030 rows, 96 columns
 *   - MSM Achievement Apr26.xlsx / Jun26.xlsx          sheets "MSM Adherence", "Over all MSM Achievement"
 *   - ZPRP Spare Cost.XLSX                            119,497 rows, 8 columns
 *
 * Previous drop (2026-07-09, 37,736 rows, 41 cols) is superseded — 11 Master Data
 * columns were renamed and `Final NPS Rating` was dropped entirely (see below).
 *
 * Rule thresholds live in RULES, alongside the field definitions they reference.
 */

// ─── Master Data — core workorder register ────────────────────────────────────
// NOTE: `npsRating` had no replacement in this drop — Customer Satisfaction and
// the NPS-based Process Breakdown rule stay dormant until that data returns.
// `busmCode` / `asmCode` / `customerCity` were dropped from the file entirely.
export const FIELD_MAP = {
  // Scoring rule fields (required by rule engine)
  month:        'MOnth1',
  imei:         'IMEI Number',
  phone:        'Customer Contact Number',
  npsRating:    'Final NPS Rating', // absent from current file — always undefined, kept for when VOC/NPS data returns

  // Org hierarchy (used to upsert Region → Dealer → ServiceCentre)
  // aspCode is the PRIMARY cross-file join key — see hierarchy resolution note below.
  aspCode:      'Service Centre Code',
  busmName:     'BUSM Name',
  asmName:      'ASM Name',
  aspName:      'ASP Name',

  // Display fields (stored in WorkOrder.rawData, surfaced on hit list)
  workorder:    'Workorder Number',
  symptomDesc:  'Symptom Code Description',
  actionDesc:   'Action Code Desc',
  model:        'Model',
  modelType:    'Model type',
  callType:     'Call Type',
  callCategory: 'Call Category',
  customerName: 'Customer Name',
  deliveryDate: 'Delivery Date',
  creationDate: 'Creation Date',
  doaType:      'DOA Type',
  warranty:     'Warranty',

  // Skill Score inputs — part consumption/value breakdown ("CPC data")
  pcbaConsumption:        'PCBA Consumption',
  pcbaValue:              'PCBA Value',
  tpLcdConsumption:       'TP/LCD Consumption',
  tpLcdValue:             'TP/LCD Value',
  batteryConsumption:     'Battery Consumption',
  batteryValue:           'Battery Value',
  subPcbaConsumption:     'Sub PCBA Consumprtion', // typo present in source file — kept verbatim
  subPcbaValue:           'Sub PCBA Value',
  accessoriesConsumption: 'Accessories Consumption',
  accessoriesValue:       'Accessories value',
  othersConsumption:      'Others Consumption',
  othersValue:            'Others Value',
  handsetValue:           'Handset Value',
  totalPartValue:         'Total Part Value',
} as const;

export type FieldMapKey = keyof typeof FIELD_MAP;

// ─── Compliance / IMEI QC sheet — SRN (Service Receipt Note) reconciliation ───
export const QC_FIELD_MAP = {
  workorder:        'Workorder Number',
  aspCode:          'ASP CODE',
  aspName:          'ASP Name',
  asmName:          'ASM',
  busmName:         'BUSM',
  complianceStatus: 'Compliance /Non-Com', // values: "Compliance" | "Non-Com" | "Non-com" (inconsistent casing in source)
  qcStatus:         'QC Status',           // "Completed" | "Faulty" | "QC Not Done"
  month:            'Month',
} as const;

// ─── Compliance / ELS DOA REP sheet — DOA claim audit ─────────────────────────
export const ELS_FIELD_MAP = {
  workorder:           'Workorder',
  aspCode:             'ASP CODE',
  aspName:             'ASPs Name',
  asmName:             'ASMs',
  busmName:            'BUSMs',
  complianceStatus:    'Compliance /Non-Com', // canonical column — "Compliance/ Non Compliance" is a near-duplicate, ignored
  nonComplianceReason: 'Non Compliance Reason',
  value:               'Value',
  handsetCategory:     'Handset category',
  month:               'Month',
} as const;

// ─── Compliance / DEF(S+D) sheet — defective/damaged spare-parts returns ──────
export const DEF_FIELD_MAP = {
  challanNo:        'Challan No.',
  workOrderNumber:  'WO Number',
  aspCode:          'Asp Code',
  partCode:         'Part Code',
  category:         'Category', // "SPARE-Defective" | "Fresh Faulty" | "Damaged"
  complianceStatus: 'Compliance /Non-Com',
  amount:           'Amount',
  debitQty:         'Short Received Qty',
  month:            'Month', // numeric month (5, 6) — "Month.1" carries the "June'26" string form, preferred for display
  monthLabel:       'Month.1',
} as const;

// ─── Service at Home — home-visit appointment lifecycle ───────────────────────
export const SAH_FIELD_MAP = {
  appointmentId:     'Appointment Id',
  workOrderNumber:   'Work Order Number', // different WO series from Master Data (510xxx) — ~65% overlap, best-effort join
  aspCode:           'Asp Code',
  aspName:           'Asp Name',
  asmName:           'Ausm Name',
  busmName:          'Busm Name',
  appointmentStatus: 'Appointment Status', // "Closed" | "In Process" | "Reject/Cancel" | "Request For Cancel" | "Assign To Technician"
  appointmentDate:   'Appointment Date',
  cancelReason:      'Cancel Remarks',
} as const;

// ─── MSM Achievement — daily ASP deposit/stock compliance (financial exposure) ─
// Source sheets are PIVOTS: one column per calendar day, header = the date itself.
// Static (non-date) columns are mapped here; date columns are discovered at parse
// time (any header that parses as a valid date) — the calendar range shifts every
// upload, so it cannot be hardcoded. See import pipeline melt step.
export const MSM_FIELD_MAP = {
  aspCode:  'Service Center Code',
  aspName:  'ASP Name',
  asmName:  'ASO/ASM Name',
  busmName: 'BUSM',
  msmTarget: 'MSM Target', // present on "MSM Adherence" sheet only — "Over all MSM Achievement" has no per-ASP target column
  totalWorkingDays: 'Total Working Days',
  msmAchievement:   'MSM Achievement',       // count of compliant days
  pctMsmAchievement: '% MSM Achievement',
} as const;

// ─── ZPRP Spare Price Catalog — reference table, no ASP link ─────────────────
export const ZPRP_FIELD_MAP = {
  materialCode:        'MATERIAL Code',
  materialDescription: 'MATERIAL DESCRIPTION',
  basicPrice:          'BASIC PRICE',
  taxAmount:           'TAX AMOUNT',
  distributorPrice:    'Distributor Price',
  taxRate:             'TAX RATE',
  validFrom:           'Valid from',
  validTo:             'Valid to',
} as const;

// ─── Month filter ─────────────────────────────────────────────────────────────
// Set to null to accept ALL months in the file (recommended — which months are
// "current" changes each upload). Set to a string array to filter to specific
// months, e.g. ['Apr', 'May', 'Jun'].
export const TARGET_MONTHS: string[] | null = null;

// ─── Rule thresholds ───────────────────────────────────────────────────────────
// Category mapping (see ARCHITECTURE.md / plan for full rationale):
//   Skill   ← Master Data only:        repeat-IMEI, DOA rate, part-consumption breakdown
//   Audit   ← Compliance sheets:       SRN (IMEI QC) non-compliance, ELS DOA non-compliance,
//                                      DEF(S+D) defective-spares non-compliance
//   Process ← TAT + S@H + MSM:         turnaround time, home-visit cancellation, financial exposure
//   VOC / Customer Satisfaction stays dormant — no Voice-of-Customer data in this drop.
export const RULES = {
  repeatImei: {
    threshold: 1,        // > 1 occurrence of the same IMEI → flagged
    penalty:   20,       // Skill_Score deduction
  },
  doa: {
    // DOA Type non-null/non-empty on a Master Data row → flagged (Skill Score input)
    penalty: 15,
  },
  suspiciousPhone: {
    threshold: 2,        // > 2 occurrences of the same phone number → flagged
    penalty:   30,
  },
  srnNonCompliance: {
    // IMEI QC sheet: complianceStatus not starting with "Compliance" (case-insensitive) → flagged
    penalty: 25,         // Audit_Score deduction
  },
  elsDoaNonCompliance: {
    // ELS DOA REP sheet: complianceStatus === "Non-Compliance" → flagged
    penalty: 25,
  },
  defectiveSpareNonCompliance: {
    // DEF(S+D) sheet: complianceStatus === "Non-Compliance" → flagged
    penalty: 15,
  },
  processBreakdown: {
    // Dormant until NPS/VOC data returns — kept unchanged per product decision.
    noResponseString: 'No Response',
    maxDetractorScore: 3,
    penalty: 15,
  },
  tat: {
    // Mean-time-to-repair threshold beyond which a workorder counts against Process Score
    maxDays: 7,
    penalty: 15,
  },
  sahCancellation: {
    // Service-at-Home appointment statuses counted as cancelled
    cancelledStatuses: ['Reject/Cancel', 'Request For Cancel'],
    penalty: 10,
  },
  msmAchievement: {
    // Daily compliance is already binary in the source (Compliance / Non Compliance) —
    // "shortfall" = a day marked Non Compliance. Flag an ASP-month if % MSM Achievement
    // falls below this threshold (financial exposure signal, not a quality signal).
    minPctThreshold: 0.75,
    penalty: 15,
  },
  hitList: {
    minAnomalies: 2,
  },
  scoreBaseline: 100,

  // Fallback per-unit costs for the Leakage Exposure tile when a part can't be
  // reconciled against SparePriceCatalog (e.g. no matching materialCode). These
  // are the same placeholders the "Part-Cost Assumptions" tab already exposes —
  // real ZPRP prices should be preferred wherever a match exists.
  leakageFallbackCost: {
    pcba: 1800,
    lcd:  1200,
    travel: 750,
  },
} as const;
