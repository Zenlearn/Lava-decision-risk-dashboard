/**
 * Shared types for the Lava rule engine.
 *
 * Two levels of output:
 *   - Row-level (WorkOrder): Skill flags (repeat IMEI, DOA) + the standalone
 *     Suspicious Phone flag — feeds RiskFlag / hit-list / Total_Anomalies,
 *     same convention as before this rebuild.
 *   - ASP-month aggregate (AspMetricRollup): the 5 Executive Dashboard tiles
 *     + 3 category scores (Skill/Audit/Process) + deep-dive child metrics,
 *     computed from ALL 6 datasets joined by (serviceCentreId, month).
 */

// ─── Row-level inputs (Master Data only) ──────────────────────────────────────

export interface MasterDataRuleRow {
  rowIndex: number;
  imei: string | null;
  phone: string | null;
  doaType: string | null;
  actionDesc: string | null;
  symptomDesc: string | null;
  callType: string | null;
  callCategory: string | null;
  creationDate: string | Date | null;
  deliveryDate: string | Date | null;
  pcbaConsumption: number | null;
  tpLcdConsumption: number | null;
  batteryConsumption: number | null;
  subPcbaConsumption: number | null;
  accessoriesConsumption: number | null;
  othersConsumption: number | null;
  totalPartValue: number | null;
  handsetValue: number | null; // used to cost the Suspicious Phone leakage subcategory — see execTiles.rule.ts
  /**
   * Whether this IMEI appears at more than one ASP within the same month.
   * MUST be computed as a single global pass over ALL ASPs' rows before
   * per-ASP aggregation — it cannot be determined from one ASP's rows alone.
   * Defaults to false if the caller hasn't computed it.
   */
  isCrossAsp: boolean;
}

export interface RowRuleResult {
  rowIndex: number;
  skillPenalty: number;
  totalAnomalies: number;
  isHitList: boolean;
  flags: {
    repeatImei:      { flagged: boolean; penalty: number; evidence: Record<string, unknown> };
    doa:             { flagged: boolean; penalty: number; evidence: Record<string, unknown> };
    suspiciousPhone: { flagged: boolean; penalty: number; evidence: Record<string, unknown> };
  };
}

// ─── Aggregate inputs (all 6 datasets, pre-filtered to one ASP + month) ───────

export interface QcRecordInput {
  complianceStatus: string | null; // "Compliance" | "Non-Com" | "Non-com"
  qcStatus: string | null;
}

export interface ElsDoaRecordInput {
  complianceStatus: string | null; // "Compliance" | "Non-Compliance"
  nonComplianceReason: string | null;
  value: number | null;
  handsetCategory: string | null;
}

export interface DefectiveSpareRecordInput {
  complianceStatus: string | null;
  amount: number | null;
  debitQty: number | null;
  partCode: string | null;
  category: string | null;
}

export interface SahAppointmentInput {
  appointmentStatus: string | null;
  appointmentDate: Date | null;
}

export interface MsmDailyRecordInput {
  date: Date;
  complianceStatus: string | null; // "Compliance" | "Non Compliance" | null (non-working day)
  balanceValue: number | null;
  msmTarget: number | null;
}

export interface SparePriceLookup {
  (materialCode: string): { basicPrice: number | null; distributorPrice: number | null } | undefined;
}

export interface AspMonthRuleInput {
  serviceCentreId: string;
  month: string;
  masterRows: MasterDataRuleRow[];
  qcRecords: QcRecordInput[];
  elsRecords: ElsDoaRecordInput[];
  defRecords: DefectiveSpareRecordInput[];
  sahAppointments: SahAppointmentInput[];
  msmRecords: MsmDailyRecordInput[];
  lookupSparePrice: SparePriceLookup;
}

// ─── ASP-month aggregate output (persisted to AspMetricRollup) ────────────────

export interface AspMonthRollupResult {
  serviceCentreId: string;
  month: string;

  // 5 Executive Dashboard tiles
  ftfr: number | null;
  csat: number | null; // always null until VOC/NPS data returns
  mttr: number | null;
  diag: number | null;
  leak: number | null;

  // 3 category scores
  skillScore: number | null;
  auditScore: number | null;
  processScore: number | null;

  childMetrics: {
    skill: {
      repeatImeiRate: number | null;
      repeatCountDistribution: Record<string, number>; // "2": n, "3": n, "4+": n
      doaRate: number | null;
      partConsumption: {
        pcba: number; tpLcd: number; battery: number; subPcba: number; accessories: number; others: number;
      };
      replacementSchemeRate: number | null;
    };
    audit: {
      srnNonComplianceRate: number | null; // IMEI QC
      qcFailureBreakdown: { faulty: number; qcNotDone: number; completed: number };
      elsNonComplianceRate: number | null;
      elsValueAtRisk: number | null;
      elsReasonBreakdown: Record<string, number>;
      defNonComplianceRate: number | null;
      defDebitValueAtRisk: number | null;
      defOverchargeCount: number;
      defOverchargeValue: number;
      vocStatus: 'dormant'; // no Voice-of-Customer data in this drop
    };
    process: {
      avgTat: number | null;
      tatOverThresholdRate: number | null;
      sahAppointmentCount: number;
      sahCancellationRate: number | null;
      msmPctAchievement: number | null;
      msmConsecutiveShortfallDays: number;
    };
    // Deep-dive breakdown for the Estimated Monthly Leakage Exposure tile.
    // Each subcategory documents its own formula so the ₹ total is auditable,
    // not a black box — see execTiles.rule.ts for the implementation.
    leakage: {
      total: number;
      subcategories: {
        ghostSameDaySwap: {
          value: number;
          count: number;
          formula: string;
        };
        homeVisitBoardRepair: {
          value: number;
          count: number;
          formula: string;
        };
        homeVisitBounceTravel: {
          value: number;
          count: number;
          formula: string;
        };
        suspiciousPhonePattern: {
          value: number;
          count: number;
          formula: string;
        };
      };
    };
  };
}
