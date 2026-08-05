import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';
import { FIELD_MAP, TARGET_MONTHS } from '../configs/fieldMap.config';
import { fetchNpsRows, groupNpsBy, summarizeNps, computeDsatBreakdown, rankByNps, NpsRawRow } from './npsAggregation.service';

export interface DashboardMetrics {
  avgProcessScore: number;
  avgSkillScore:   number;
  avgAuditScore:   number;
  totalWorkOrders: number;
  totalAnomalies:  number;
}

export interface MonthlyTrend {
  month:        string;
  processScore: number;
  skillScore:   number;
  auditScore:   number;
}

export interface HitListPreviewItem {
  id:             string;
  workorder:      string;
  aspName:        string;
  customerCity:   string;
  imei:           string;
  symptomDesc:    string;
  totalAnomalies: number;
  flags: {
    repeatImei:      boolean;
    doa:             boolean;
    suspiciousPhone: boolean;
  };
}

export interface ExecutiveDashboardData {
  importId: string | null;
  filename: string | null;
  metrics:  DashboardMetrics;
  trends:   MonthlyTrend[];
  hitList:  HitListPreviewItem[];
  hitListCount: number;
  filters: {
    busms: string[];
    asms:  string[];
    asps:  string[];
  };
}

export interface DealerDashboardData {
  importId:        string | null;
  aspName:         string;
  metrics:         DashboardMetrics;
  incidentSummary: {
    repeatImei:      number;
    doa:             number;
    suspiciousPhone: number;
  };
  flaggedWorkOrders: HitListPreviewItem[];
}

/** Get the latest successful import record. */
/**
 * Latest COMPLETE Master Data import specifically — NOT the latest import
 * across any dataset type. WorkOrder-based metrics (totalWorkOrders,
 * totalAnomalies, hit list) only ever come from Master Data; if this picked
 * up the latest import regardless of type, uploading e.g. Service at Home
 * after Master Data would point `importId` at a dataset with zero WorkOrders,
 * silently zeroing every WorkOrder-derived field.
 */
async function getLatestImportId(): Promise<{ id: string; filename: string } | null> {
  const latest = await prisma.monthlyImport.findFirst({
    where:   { status: 'COMPLETE', datasetType: 'MASTER_DATA' },
    orderBy: { importedAt: 'desc' },
    select:  { id: true, filename: true },
  });
  return latest;
}

/** Remaps numeric months string (e.g. 'Feb', 'May') to categories for sorting. */
const MONTH_ORDER: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
};

function sortTrends(trends: MonthlyTrend[]): MonthlyTrend[] {
  return [...trends].sort((a, b) => {
    const orderA = MONTH_ORDER[a.month.slice(0, 3)] ?? 99;
    const orderB = MONTH_ORDER[b.month.slice(0, 3)] ?? 99;
    return orderA - orderB;
  });
}

/**
 * Fetch Executive Dashboard Data
 * 
 * Aggregates all service centers, regions, and monthly trends for the latest import.
 * Supports filters for BUSM Name (Business Unit) and ASM Name (Supervisor).
 */
export async function getExecutiveDashboard(filters?: {
  busmName?: string;
  asmName?: string;
}): Promise<ExecutiveDashboardData> {
  const latestImport = await getLatestImportId();
  if (!latestImport) {
    return {
      importId: null,
      filename: null,
      metrics: { avgProcessScore: 0, avgSkillScore: 0, avgAuditScore: 0, totalWorkOrders: 0, totalAnomalies: 0 },
      trends: [],
      hitList: [],
      hitListCount: 0,
      filters: { busms: [], asms: [], asps: [] },
    };
  }

  const importId = latestImport.id;

  // Build prisma query conditions based on hierarchy filters
  const workOrderFilter: any = { importId };
  const serviceCentreFilter: any = {};

  if (filters?.busmName && filters.busmName !== 'All') {
    workOrderFilter.serviceCentre = {
      dealer: {
        region: {
          name: filters.busmName
        }
      }
    };
    serviceCentreFilter.dealer = { region: { name: filters.busmName } };
  }

  if (filters?.asmName && filters.asmName !== 'All') {
    workOrderFilter.serviceCentre = {
      ...(workOrderFilter.serviceCentre ?? {}),
      dealer: {
        ...(workOrderFilter.serviceCentre?.dealer ?? {}),
        name: filters.asmName
      }
    };
    serviceCentreFilter.dealer = { ...(serviceCentreFilter.dealer ?? {}), name: filters.asmName };
  }

  // 1. Fetch aggregate scores from AspMetricRollup — NOT live-recomputed from
  // WorkOrder.rawData on every request. Skill/Audit/Process are ASP-month
  // aggregates (see rules/engine.ts computeAspMonthRollup); scoping by
  // BUSM/ASM hierarchy means first resolving which ServiceCentres match, then
  // averaging their rollup rows.
  const matchingServiceCentres = Object.keys(serviceCentreFilter).length > 0
    ? await prisma.serviceCentre.findMany({ where: serviceCentreFilter, select: { id: true } })
    : null;
  const rollupFilter: any = matchingServiceCentres ? { serviceCentreId: { in: matchingServiceCentres.map((s) => s.id) } } : {};

  const rollupRows = await prisma.aspMetricRollup.findMany({ where: rollupFilter });

  const avg = (vals: (number | null)[]): number => {
    const nonNull = vals.filter((v): v is number => v !== null);
    return nonNull.length > 0 ? Math.round((nonNull.reduce((a, b) => a + b, 0) / nonNull.length) * 10) / 10 : 0;
  };

  // totalWorkOrders / totalAnomalies still come from WorkOrder — they're
  // per-workorder counts, not ASP-month aggregates. Filtered for Smart/Tablet.
  const allWorkOrdersForAgg = await prisma.workOrder.findMany({
    where: workOrderFilter,
    select: { id: true, totalAnomalies: true, rawData: true }
  });
  const filteredAggWos = allWorkOrdersForAgg.filter((wo) => {
    const raw = wo.rawData as any;
    const modelType = String(
      raw[FIELD_MAP.modelType] || raw['Model type'] || raw['Model Type'] || ''
    ).trim().toLowerCase();
    return modelType.includes('smart') || modelType.includes('tablet');
  });
  const totalAnomalies = filteredAggWos.reduce((sum, w) => sum + (w.totalAnomalies || 0), 0);
  const totalWorkOrders = filteredAggWos.length;

  const metrics: DashboardMetrics = {
    avgProcessScore: avg(rollupRows.map((r) => r.processScore)),
    avgSkillScore:   avg(rollupRows.map((r) => r.skillScore)),
    avgAuditScore:   avg(rollupRows.map((r) => r.auditScore)),
    totalWorkOrders,
    totalAnomalies,
  };

  // 2. Monthly trend data — group AspMetricRollup by month
  const rollupsByMonth = new Map<string, typeof rollupRows>();
  for (const r of rollupRows) {
    if (!rollupsByMonth.has(r.month)) rollupsByMonth.set(r.month, []);
    rollupsByMonth.get(r.month)!.push(r);
  }

  const trends: MonthlyTrend[] = sortTrends(
    Array.from(rollupsByMonth.entries()).map(([month, rows]) => ({
      month,
      processScore: avg(rows.map((r) => r.processScore)),
      skillScore:   avg(rows.map((r) => r.skillScore)),
      auditScore:   avg(rows.map((r) => r.auditScore)),
    }))
  );

  // 3. Fetch Action Center Hit List (Total Anomalies >= 2) — still row-level,
  // sourced from WorkOrder/RiskFlag (Skill-only flags: Repeat IMEI, DOA, plus
  // the standalone Suspicious Phone signal — see rules/engine.ts).
  const rawHitList = await prisma.workOrder.findMany({
    where: {
      ...workOrderFilter,
      totalAnomalies: { gte: 2 },
    },
    orderBy: {
      totalAnomalies: 'desc',
    },
    include: {
      serviceCentre: true,
      riskFlags:     true,
    },
  });

  const hitListRaw = rawHitList.filter((wo) => {
    const raw = wo.rawData as any;
    const modelType = String(
      raw[FIELD_MAP.modelType] || raw['Model type'] || raw['Model Type'] || ''
    ).trim().toLowerCase();
    return modelType.includes('smart') || modelType.includes('tablet');
  });

  const hitList: HitListPreviewItem[] = hitListRaw.slice(0, 100).map((wo) => {
    const rawData = wo.rawData as Record<string, unknown>;
    return {
      id:             wo.id,
      workorder:      String(rawData[FIELD_MAP.workorder] ?? wo.id),
      aspName:        wo.serviceCentre.name,
      customerCity:   '', // Customer City column dropped from Master Data in the Jul 2026 drop
      imei:           String(rawData[FIELD_MAP.imei] ?? ''),
      symptomDesc:    String(rawData[FIELD_MAP.symptomDesc] ?? ''),
      totalAnomalies: wo.totalAnomalies ?? 0,
      flags: {
        repeatImei:      wo.riskFlags.some((rf) => rf.ruleKey === 'repeatImei'),
        doa:             wo.riskFlags.some((rf) => rf.ruleKey === 'doa'),
        suspiciousPhone: wo.riskFlags.some((rf) => rf.ruleKey === 'suspiciousPhone'),
      },
    };
  });

  // 4. Fetch list of unique BUSM, ASM, and ASP names for filters
  const busms = await prisma.region.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  }).then((res) => res.map((r) => r.name));

  const asms = await prisma.dealer.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  }).then((res) => res.map((d) => d.name));

  const asps = await prisma.serviceCentre.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  }).then((res) => res.map((s) => s.name));

  // Count total items on hit list matching query criteria
  const hitListCount = hitListRaw.length;

  return {
    importId,
    filename: latestImport.filename,
    metrics,
    trends,
    hitList,
    hitListCount,
    filters: { busms, asms, asps },
  };
}

/**
 * Fetch Dealer (ASP) Dashboard Data
 * 
 * Aggregates results for a specific Service Centre.
 */
export async function getDealerDashboard(aspName: string): Promise<DealerDashboardData> {
  const latestImport = await getLatestImportId();
  if (!latestImport) {
    return {
      importId: null,
      aspName,
      metrics: { avgProcessScore: 0, avgSkillScore: 0, avgAuditScore: 0, totalWorkOrders: 0, totalAnomalies: 0 },
      incidentSummary: { repeatImei: 0, doa: 0, suspiciousPhone: 0 },
      flaggedWorkOrders: [],
    };
  }

  const importId = latestImport.id;

  // Find the service center first
  const serviceCentre = await prisma.serviceCentre.findFirst({
    where: { name: aspName },
    select: { id: true },
  });

  if (!serviceCentre) {
    throw new Error(`Service Centre with name "${aspName}" not found`);
  }

  const serviceCentreId = serviceCentre.id;
  const filterClause = { importId, serviceCentreId };

  // 1. Fetch category scores from AspMetricRollup (all months for this ASP) —
  // Skill/Audit/Process are ASP-month aggregates, not per-workorder columns.
  const rollupRows = await prisma.aspMetricRollup.findMany({ where: { serviceCentreId } });
  const avg = (vals: (number | null)[]): number => {
    const nonNull = vals.filter((v): v is number => v !== null);
    return nonNull.length > 0 ? Math.round((nonNull.reduce((a, b) => a + b, 0) / nonNull.length) * 10) / 10 : 0;
  };

  const allScorecardWos = await prisma.workOrder.findMany({
    where: filterClause,
    include: {
      riskFlags: true,
      serviceCentre: true,
    }
  });

  const filteredScorecardWos = allScorecardWos.filter((wo) => {
    const raw = wo.rawData as any;
    const modelType = String(
      raw[FIELD_MAP.modelType] || raw['Model type'] || raw['Model Type'] || ''
    ).trim().toLowerCase();
    return modelType.includes('smart') || modelType.includes('tablet');
  });

  const totalWorkOrders = filteredScorecardWos.length;
  const totalAnomalies = filteredScorecardWos.reduce((sum, w) => sum + (w.totalAnomalies || 0), 0);

  const metrics: DashboardMetrics = {
    avgProcessScore: avg(rollupRows.map((r) => r.processScore)),
    avgSkillScore:   avg(rollupRows.map((r) => r.skillScore)),
    avgAuditScore:   avg(rollupRows.map((r) => r.auditScore)),
    totalWorkOrders,
    totalAnomalies,
  };

  // 2. Incident Summary Count
  const repeatImeiCount = filteredScorecardWos.filter((w) => w.riskFlags.some((rf) => rf.ruleKey === 'repeatImei')).length;
  const doaCount = filteredScorecardWos.filter((w) => w.riskFlags.some((rf) => rf.ruleKey === 'doa')).length;
  const suspiciousPhoneCount = filteredScorecardWos.filter((w) => w.riskFlags.some((rf) => rf.ruleKey === 'suspiciousPhone')).length;

  // 3. Flagged Workorders (anomalies > 0)
  const flaggedWosRaw = filteredScorecardWos.filter((w) => (w.totalAnomalies || 0) > 0);
  flaggedWosRaw.sort((a, b) => (b.totalAnomalies || 0) - (a.totalAnomalies || 0));

  const flaggedWorkOrders: HitListPreviewItem[] = flaggedWosRaw.map((wo) => {
    const rawData = wo.rawData as Record<string, unknown>;
    return {
      id:             wo.id,
      workorder:      String(rawData[FIELD_MAP.workorder] ?? wo.id),
      aspName:        wo.serviceCentre.name,
      customerCity:   '', // Customer City column dropped from Master Data in the Jul 2026 drop
      imei:           String(rawData[FIELD_MAP.imei] ?? ''),
      symptomDesc:    String(rawData[FIELD_MAP.symptomDesc] ?? ''),
      totalAnomalies: wo.totalAnomalies ?? 0,
      flags: {
        repeatImei:      wo.riskFlags.some((rf) => rf.ruleKey === 'repeatImei'),
        doa:             wo.riskFlags.some((rf) => rf.ruleKey === 'doa'),
        suspiciousPhone: wo.riskFlags.some((rf) => rf.ruleKey === 'suspiciousPhone'),
      },
    };
  });

  return {
    importId,
    aspName,
    metrics,
    incidentSummary: {
      repeatImei:      repeatImeiCount,
      doa:             doaCount,
      suspiciousPhone: suspiciousPhoneCount,
    },
    flaggedWorkOrders,
  };
}

/**
 * Calculates standard deviation.
 */
function getStdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const sumOfSquares = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / (values.length - 1));
}

/**
 * Calculates percentile value (P90, etc.) from an array.
 */
function getPercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

/**
 * Safe integer division — returns 0 instead of NaN or Infinity when denominator is 0.
 * Rounds to given decimal places (default 1).
 */
function safeDivide(numerator: number, denominator: number, decimals = 1): number {
  if (denominator === 0 || !isFinite(denominator)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((numerator / denominator) * factor) / factor;
}

// ─── Robust Date Parsing Helpers ──────────────────────────────────────────────
function parseDateRobust(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const str = String(val).trim();
  if (!str) return null;

  // 1. First check DD-MM-YYYY (e.g. 13-02-2026)
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    const day = parseInt(m[1]!, 10);
    const month = parseInt(m[2]!, 10) - 1;
    const year = parseInt(m[3]!, 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Check DD/MM/YYYY or MM/DD/YYYY with slashes.
  //
  // NOTE: when both parts are <=12 (e.g. "05/06/2024"), this is genuinely
  // ambiguous from the digits alone — no parser can recover the true day/month
  // without knowing the source locale. We default to DD/MM/YYYY because Lava's
  // service data is India-sourced (the standard local format), and only fall
  // back to MM/DD/YYYY when the second part is >12, which unambiguously means
  // it must be the year... i.e. the first part can't be a day, so p1 is the
  // month. This changes the interpretation of every ambiguous date compared to
  // the previous MM/DD-default behavior — if TAT/MTTR figures look shifted by
  // a matter of days after this change, this default is the reason why.
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const p1 = parseInt(m[1]!, 10);
    const p2 = parseInt(m[2]!, 10);
    let year = parseInt(m[3]!, 10);
    if (year < 100) year += year < 50 ? 2000 : 1900;

    if (p2 > 12) {
      return new Date(year, p1 - 1, p2); // p2 can't be a month -> p1 is month, p2 is day
    } else {
      return new Date(year, p2 - 1, p1); // default DD/MM -> p1 is day, p2 is month
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function getDaysDiff(cStr: any, dStr: any): number | null {
  const cDate = parseDateRobust(cStr);
  const dDate = parseDateRobust(dStr);
  if (!cDate || !dDate) return null;
  const cTime = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate()).getTime();
  const dTime = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate()).getTime();
  return Math.max(0, Math.round((dTime - cTime) / (1000 * 60 * 60 * 24)));
}

function matchesField(val1: any, val2: any, keyword: string): boolean {
  const s1 = String(val1 || '').toLowerCase();
  const s2 = String(val2 || '').toLowerCase();
  return s1.includes(keyword) || s2.includes(keyword);
}

/**
 * Dynamically computes the full multi-tab dashboard dataset structure
 * matching original mockup 'Lava_Decision_Risk_Dashboard.html'.
 */
export async function getFullDashboardData(filters?: {
  busmName?: string;
  asmName?: string;
}): Promise<any> {
  // MASTER_DATA specifically — WorkOrders only ever belong to a Master Data
  // import. Without this filter, importing any other dataset type (MSM,
  // Compliance, NPS, ...) after the last Master Data upload would make THAT
  // import "latest", filtering workOrders down to zero and breaking the
  // whole page.
  const latestImport = await prisma.monthlyImport.findFirst({
    where: { status: 'COMPLETE', datasetType: 'MASTER_DATA' },
    orderBy: { importedAt: 'desc' },
  });

  if (!latestImport) {
    return {
      summary: { total_wo: 0, cross_rows: 0, importId: '', filename: '' },
      org: [],
      kpi: { months: [], overall: { ftfr: 0, mttr: 0, nps: 0, diag: 0, leak: 0, _leakparts: { pcba: 0, lcd: 0 }, _leaktravel: 0, bounce: 0, detractor: 0 }, targets: { ftfr: 85, mttr: 2, diag: 98 } },
      busm: [],
      asm: [],
      asp: [],
      hier: {},
      evidence: [],
      coaching: { asm: { cards: {}, thresholds: {} }, asp: { cards: {}, thresholds: {} }, busm: { cards: {}, thresholds: {} } }
    };
  }

  // Fetch all completed workorders
  const whereClause: any = { importId: latestImport.id };
  if (TARGET_MONTHS && TARGET_MONTHS.length > 0) {
    whereClause.month = { in: TARGET_MONTHS };
  }

  if (filters?.busmName && filters.busmName !== 'All') {
    whereClause.serviceCentre = {
      dealer: {
        region: {
          name: filters.busmName
        }
      }
    };
  }

  if (filters?.asmName && filters.asmName !== 'All') {
    whereClause.serviceCentre = {
      ...(whereClause.serviceCentre ?? {}),
      dealer: {
        ...(whereClause.serviceCentre?.dealer ?? {}),
        name: filters.asmName
      }
    };
  }

  const rawWorkOrders = await prisma.workOrder.findMany({
    where: whereClause,
    select: {
      id: true,
      month: true,
      rawData: true,
      skillScore: true,
      auditScore: true,
      processScore: true,
      totalAnomalies: true,
      serviceCentre: {
        select: {
          id: true,
          code: true,
          name: true,
          dealer: {
            select: {
              name: true,
              region: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  // Keep strictly Smart and Tablet models (Feature Phones excluded)
  const workOrders = rawWorkOrders.filter((wo) => {
    const raw = wo.rawData as any;
    const modelType = String(
      raw[FIELD_MAP.modelType] || raw['Model type'] || raw['Model Type'] || ''
    ).trim().toLowerCase();
    return modelType.includes('smart') || modelType.includes('tablet');
  });

  // Frequency mapping caches
  const imeiCounts = new Map<string, number>();
  const phoneCounts = new Map<string, number>();
  const imeiToAsps = new Map<string, Set<string>>();

  // 60-day repeat detection: collect all creation dates per IMEI across the full dataset
  const imeiCreationDates = new Map<string, Date[]>();

  workOrders.forEach((wo) => {
    const raw = wo.rawData as any;
    const imei = String(raw[FIELD_MAP.imei] || '').trim();
    const phone = String(raw[FIELD_MAP.phone] || '').trim();
    const asp = wo.serviceCentre.name;

    if (imei && imei !== 'nan') {
      imeiCounts.set(imei, (imeiCounts.get(imei) || 0) + 1);
      if (!imeiToAsps.has(imei)) {
        imeiToAsps.set(imei, new Set());
      }
      imeiToAsps.get(imei)!.add(asp);

      // Collect creation dates for 60-day repeat check
      const cDateStr = raw[FIELD_MAP.creationDate] || raw['Call Date'] || raw['Call Creation Date'] || raw['Job Sheet Date'] || raw['Creation Date'];
      const cDate = parseDateRobust(cDateStr);
      if (cDate) {
        if (!imeiCreationDates.has(imei)) imeiCreationDates.set(imei, []);
        imeiCreationDates.get(imei)!.push(cDate);
      }
    }

    if (phone && phone !== 'nan') {
      phoneCounts.set(phone, (phoneCounts.get(phone) || 0) + 1);
    }
  });

  // Sort each IMEI's creation date list ascending (needed for O(log n) bisect below)
  imeiCreationDates.forEach((dates) => dates.sort((a, b) => a.getTime() - b.getTime()));

  let crossRowsCount = 0;
  
  // Categorise and flag workorders in a single mapping pass
  const processedRows = workOrders.map((wo, index) => {
    const raw = wo.rawData as any;
    const imei = String(raw[FIELD_MAP.imei] || '').trim();
    const phone = String(raw[FIELD_MAP.phone] || '').trim();
    
    const asp = wo.serviceCentre.name;
    const asm = wo.serviceCentre.dealer.name;
    const busm = wo.serviceCentre.dealer.region.name;
    const model = String(raw[FIELD_MAP.model] || '');
    const modelType = String(raw[FIELD_MAP.modelType] || raw['Model type'] || raw['Model Type'] || '').trim();
    const symptomRaw = String(raw[FIELD_MAP.symptomDesc] || '');
    const rawActionStr = String(raw['Action Code Desc'] || raw['Action Taken'] || '').trim();
    const actionRaw = rawActionStr !== '' ? rawActionStr : 'UNSPECIFIED / NOT RECORDED';
    const partRaw = String(raw['Part Name'] || raw['Part Description'] || '');
    const city = ''; // Customer City column dropped from Master Data in the Jul 2026 drop

    const cDateStr = raw[FIELD_MAP.creationDate] || raw['Call Date'] || raw['Call Creation Date'] || raw['Job Sheet Date'] || raw['Creation Date'];
    const dDateStr = raw[FIELD_MAP.deliveryDate] || raw['Closed Date'] || raw['Delivery Date'] || raw['Call Closed Date'];
    const tat = getDaysDiff(cDateStr, dDateStr);
    const isSameDay = tat === 0 || tat === 1;

    // 60-day repeat detection: this WO is a repeat if the same IMEI had any
    // earlier call within 60 calendar days of this call's creation date.
    let isRepeat60d = false;
    if (imei && imei !== 'nan') {
      const thisCDate = parseDateRobust(cDateStr);
      const allDates = imeiCreationDates.get(imei);
      if (thisCDate && allDates && allDates.length > 1) {
        const thisTime = thisCDate.getTime();
        for (const priorDate of allDates) {
          const priorTime = priorDate.getTime();
          if (priorTime >= thisTime) break; // sorted ascending — no earlier dates remain
          const daysDiff = Math.round((thisTime - priorTime) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 60) {
            isRepeat60d = true;
            break;
          }
        }
      }
    }

    const isWalkIn = matchesField(raw[FIELD_MAP.callType], raw[FIELD_MAP.callCategory], 'walk-in') || 
                     matchesField(raw[FIELD_MAP.callType], raw[FIELD_MAP.callCategory], 'walk in');
    
    const isHome = matchesField(raw[FIELD_MAP.callType], raw[FIELD_MAP.callCategory], 'home');
    
    const partUpper = partRaw.toUpperCase();
    const actionUpper = actionRaw.toUpperCase();
    const symptomUpper = symptomRaw.toUpperCase();

    const isPCBA = partUpper.includes('PCBA') || partUpper.includes('MOTHERBOARD') || partUpper.includes('MAIN BOARD') ||
                   actionUpper.includes('PCBA') || actionUpper.includes('MOTHERBOARD') || actionUpper.includes('MAIN BOARD');

    const isLCD = partUpper.includes('LCD') || partUpper.includes('DISPLAY') || partUpper.includes('TOUCH') ||
                  actionUpper.includes('LCD') || actionUpper.includes('DISPLAY') || actionUpper.includes('TOUCH') ||
                  symptomUpper.includes('DISPLAY') || symptomUpper.includes('TOUCH');

    const isBattery = partUpper.includes('BATTERY') || partUpper.includes('BATT') ||
                      actionUpper.includes('BATTERY') || actionUpper.includes('BATT') ||
                      symptomUpper.includes('BATTERY');

    const isCamera = partUpper.includes('CAMERA') || partUpper.includes('CAM') ||
                     actionUpper.includes('CAMERA') || actionUpper.includes('CAM') ||
                     symptomUpper.includes('CAMERA');

    const isSpeaker = partUpper.includes('SPEAKER') || partUpper.includes('MIC') || partUpper.includes('AUDIO') ||
                      actionUpper.includes('SPEAKER') || actionUpper.includes('MIC') || actionUpper.includes('AUDIO') ||
                      symptomUpper.includes('SPEAKER');

    const isCharger = partUpper.includes('CHARGER') || partUpper.includes('CHARGE') || partUpper.includes('CABLE') ||
                      actionUpper.includes('CHARGER') || actionUpper.includes('CHARGE') || actionUpper.includes('CABLE') ||
                      symptomUpper.includes('CHARGING');

    const isBoard = isPCBA || isLCD;

    const isGhost = isWalkIn && isSameDay && isBoard;
    const isHomeBoard = isHome && isSameDay && isBoard;
    
    const isBounce = (imeiCounts.get(imei) ?? 0) > 1;
    const isCrossAsp = (imeiToAsps.get(imei)?.size ?? 0) > 1;
    if (isCrossAsp) crossRowsCount++;

    const symptomLower = symptomRaw.toLowerCase();
    const isHwSymptom = symptomLower.includes('display') || symptomLower.includes('touch') || symptomLower.includes('light') || 
                        symptomLower.includes('mic') || symptomLower.includes('speaker') || symptomLower.includes('charging') || 
                        symptomLower.includes('charge') || symptomLower.includes('power') || symptomLower.includes('switch') || 
                        symptomLower.includes('camera') || symptomLower.includes('keypad') || symptomLower.includes('dead') || 
                        symptomLower.includes('restart') || symptomLower.includes('damaged') || symptomLower.includes('cracked') || 
                        symptomLower.includes('broken');

    const actionLower = actionRaw.toLowerCase();
    const isSwAction = actionLower.includes('software') || actionLower.includes('sw upgrade') || actionLower.includes('flashing') || 
                       actionLower.includes('upgrade') || actionLower.includes('reset') || actionLower.includes('os') || 
                       actionLower.includes('setting') || actionLower.includes('reload');

    const isMismatch = isHwSymptom && isSwAction;
    const isMismatchBounced = isMismatch && isBounce;

    const nps = String(raw[FIELD_MAP.npsRating] || '');
    const npsVal = parseInt(nps, 10);
    const isDetractor = !isNaN(npsVal) && npsVal >= 1 && npsVal <= 3;
    const isDOA = matchesField(raw[FIELD_MAP.callType], raw[FIELD_MAP.callCategory], 'doa') || 
                  String(raw[FIELD_MAP.symptomDesc] || '').toLowerCase().includes('doa');

    let flagType = '';
    if (isGhost) flagType = 'Same-day board swap (walk-in)';
    else if (isHomeBoard) flagType = 'Board repair at home';
    else if (isCrossAsp) flagType = 'Cross-ASP IMEI';
    else if (isMismatchBounced) flagType = 'Mismatch that bounced';
    else if (isMismatch) flagType = 'Symptom-action mismatch';
    else if (isBounce) flagType = 'Repeat bounce';

    let mClean = 'Unknown';
    if (wo.month) {
      const mStr = wo.month.trim().slice(0, 3).toLowerCase();
      if (mStr === 'jan') mClean = 'Jan';
      else if (mStr === 'feb') mClean = 'Feb';
      else if (mStr === 'mar') mClean = 'Mar';
      else if (mStr === 'apr') mClean = 'Apr';
      else if (mStr === 'may') mClean = 'May';
      else if (mStr === 'jun' || mStr === 'june') mClean = 'Jun';
      else if (mStr === 'jul' || mStr === 'july') mClean = 'Jul';
      else if (mStr === 'aug') mClean = 'Aug';
      else if (mStr === 'sep') mClean = 'Sep';
      else if (mStr === 'oct') mClean = 'Oct';
      else if (mStr === 'nov') mClean = 'Nov';
      else if (mStr === 'dec') mClean = 'Dec';
      else {
        mClean = mStr.charAt(0).toUpperCase() + mStr.slice(1);
      }
    }

    // Dynamic scores calculation based on mockup rules
    let auditScore = 100;
    if (isGhost) auditScore -= 35;
    if (isCrossAsp) auditScore -= 35;
    if (isHomeBoard) auditScore -= 30;
    auditScore = Math.max(0, auditScore);

    let skillScore = 100;
    if (isBounce) skillScore -= 20;
    if (isMismatchBounced) skillScore -= 25;
    skillScore = Math.max(0, skillScore);

    let processScore = 100;
    if (tat !== null && tat > 7) processScore -= 15;
    if (isDetractor) processScore -= 20;
    processScore = Math.max(0, processScore);

    const parseNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      const cleaned = String(val).replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const totalPartVal = parseNumber(raw[FIELD_MAP.totalPartValue] || raw['Total Part Value']);
    const pcbaVal = parseNumber(raw[FIELD_MAP.pcbaValue] || raw['PCBA Value']);
    const lcdVal = parseNumber(raw[FIELD_MAP.tpLcdValue] || raw['TP/LCD Value']);
    const batteryVal = parseNumber(raw[FIELD_MAP.batteryValue] || raw['Battery Value']);
    const subPcbaVal = parseNumber(raw[FIELD_MAP.subPcbaValue] || raw['Sub PCBA Value']);
    const accessoriesVal = parseNumber(raw[FIELD_MAP.accessoriesValue] || raw['Accessories value']);
    const othersVal = parseNumber(raw[FIELD_MAP.othersValue] || raw['Others Value']);
    const handsetVal = parseNumber(raw[FIELD_MAP.handsetValue] || raw['Handset Value']);

    // cpcPartVal: real part cost only (no hardcoded fallback) — used for CPC metric
    const componentSum = pcbaVal + lcdVal + batteryVal + subPcbaVal + accessoriesVal + othersVal;
    const cpcPartVal = totalPartVal > 0 ? totalPartVal : componentSum;

    // actualPartVal: adds hardcoded cost estimates when real data is absent — used only for leakage exposure
    let actualPartVal = totalPartVal;
    if (actualPartVal === 0) {
      actualPartVal = componentSum;
    }
    if (actualPartVal === 0) {
      if (isPCBA) actualPartVal += 1800;
      if (isLCD) actualPartVal += 1200;
      if (isBattery) actualPartVal += 600;
      if (isCamera) actualPartVal += 450;
      if (isSpeaker) actualPartVal += 150;
      if (isCharger) actualPartVal += 250;
    }
    let travelVal = 0;
    if (isHome && (isBounce || isGhost || isCrossAsp)) {
      travelVal = 500;
    }
    const isSahCall = isHome || !isWalkIn;
    const isAnomalous = isSahCall && (isGhost || isHomeBoard || isCrossAsp || isBounce || isMismatchBounced || isMismatch);
    const leakageValue = isAnomalous ? (actualPartVal + travelVal) : 0;
    const partLeakageVal = isAnomalous ? actualPartVal : 0;

    let partCategory = 'others';
    if (isPCBA) partCategory = 'pcba';
    else if (isLCD) partCategory = 'lcd';
    else if (isBattery) partCategory = 'battery';
    else if (isCamera) partCategory = 'camera';
    else if (isSpeaker) partCategory = 'speaker';
    else if (isCharger) partCategory = 'charger';

    return {
      row: index + 2,
      wo: String(raw[FIELD_MAP.workorder] ?? wo.id),
      aspCode: wo.serviceCentre?.code || String(raw['Asp Code'] || raw['ASP Code'] || raw['Service Center Code'] || ''),
      serviceCentreId: wo.serviceCentre?.id || '',
      asp,
      asm,
      busm,
      city,
      created: raw[FIELD_MAP.creationDate] ? String(raw[FIELD_MAP.creationDate]).split('T')[0] : null,
      delivered: raw[FIELD_MAP.deliveryDate] ? String(raw[FIELD_MAP.deliveryDate]).split('T')[0] : null,
      month: mClean,
      model,
      symptom: symptomRaw,
      action: actionRaw,
      part: partRaw,
      tat,
      flag: flagType,
      isGhost,
      isHomeBoard,
      isHome,
      isBounce,
      isRepeat60d,
      isCrossAsp,
      isMismatch,
      isMismatchBounced,
      isDetractor,
      isDOA,
      isPCBA,
      isLCD,
      isBattery,
      isCamera,
      isSpeaker,
      isCharger,
      leakageValue,
      partLeakageVal,
      actualPartVal,
      cpcPartVal,
      handsetVal,
      travelVal,
      partCategory,
      processScore,
      skillScore,
      auditScore,
      rawData: raw,
    };
  });

  const uniqueMonths = [...new Set(processedRows.map((r) => r.month))].filter((m) => m !== 'Unknown');

  // Chronological sort order helper
  const MONTH_ORDER: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  uniqueMonths.sort((a, b) => (MONTH_ORDER[a] ?? 99) - (MONTH_ORDER[b] ?? 99));

  // Real NPS survey data (IVR/WhatsApp per-call surveys) — fetched once and
  // grouped per usage site below. This is the only source of Customer
  // Satisfaction/NPS anywhere in the app; Master Data's own "Final NPS
  // Rating" column was dropped from the source file and stays dormant.
  const npsRows = await fetchNpsRows();
  const npsByMonth = groupNpsBy(npsRows, (r) => r.month);

  // 3. DATA.org monthly aggregates
  const org = uniqueMonths.map((m) => {
    const mRows = processedRows.filter((r) => r.month === m);
    const woCount = mRows.length;

    const totalProcess = mRows.reduce((sum, r) => sum + r.processScore, 0);
    const totalSkill = mRows.reduce((sum, r) => sum + r.skillScore, 0);
    const totalAudit = mRows.reduce((sum, r) => sum + r.auditScore, 0);

    const ghost = mRows.filter((r) => r.isGhost).length;
    const home_board = mRows.filter((r) => r.isHomeBoard).length;
    const crossRows = mRows.filter((r) => r.isCrossAsp).length;
    
    // Distinct devices (unique IMEIs) for cross_dev
    const crossDevIMEIs = new Set(mRows.filter((r) => r.isCrossAsp).map((r) => String(r.rawData[FIELD_MAP.imei] || '')));

    const bounce = mRows.filter((r) => r.isBounce).length;
    const mismatch = mRows.filter((r) => r.isMismatch).length;
    const mismatch_bounced = mRows.filter((r) => r.isMismatchBounced).length;
    // Real detractor count from actual NPS survey responses this month
    // (rating 1-2) — Master Data's own npsRating column is dropped/dormant.
    const detractor = npsRows.filter((r) => r.month === m && r.rating !== null && r.rating <= 2).length;
    const doa = mRows.filter((r) => r.isDOA).length;

    return {
      month: m,
      wo: woCount,
      process: safeDivide(totalProcess, woCount),
      skill:   safeDivide(totalSkill,   woCount),
      audit:   safeDivide(totalAudit,   woCount),
      ghost,
      home_board,
      cross_dev: crossDevIMEIs.size,
      cross_rows: crossRows,
      bounce,
      mismatch,
      mismatch_bounced,
      detractor,
      doa,
      wo_month: woCount,
    };
  });

  // 4. DATA.kpi monthly metrics
  const kpiMonths = uniqueMonths.map((m) => {
    const mRows = processedRows.filter((r) => r.month === m);
    const woCount = mRows.length;

    const bounceCount = mRows.filter((r) => r.isBounce).length;
    // Real detractor count from actual NPS survey responses this month.
    const detractorCount = npsRows.filter((r) => r.month === m && r.rating !== null && r.rating <= 2).length;
    const mismatchBouncedCount = mRows.filter((r) => r.isMismatchBounced).length;

    const ftfr = woCount > 0 ? Math.round((1 - bounceCount / woCount) * 1000) / 10 : 0;
    
    const tatRows = mRows.filter((r) => r.tat !== null);
    const mttr = tatRows.length > 0 ? Math.round((tatRows.reduce((sum, r) => sum + r.tat!, 0) / tatRows.length) * 100) / 100 : 0;

    const tat1d = tatRows.filter((r) => r.tat! <= 1).length;
    const tat3d = tatRows.filter((r) => r.tat! > 1 && r.tat! <= 3).length;
    const tatGt3d = tatRows.filter((r) => r.tat! > 3).length;

    const tatDistribution = [
      { key: '1d', label: 'Repaired in 1 Day (24 Hours)', quantity: tat1d, pct: tatRows.length > 0 ? Math.round((tat1d / tatRows.length) * 1000) / 10 : 0 },
      { key: '3d', label: 'Repaired in 2 – 3 Days', quantity: tat3d, pct: tatRows.length > 0 ? Math.round((tat3d / tatRows.length) * 1000) / 10 : 0 },
      { key: 'gt3d', label: 'Repaired in > 3 Days', quantity: tatGt3d, pct: tatRows.length > 0 ? Math.round((tatGt3d / tatRows.length) * 1000) / 10 : 0 },
    ];

    // Real NPS survey data for this month (all device categories combined —
    // matches the Executive tile's national-headline intent). No fallback:
    // a month with zero survey responses gets hasNpsData: false, not a
    // fabricated distribution that looks like real data.
    const monthNpsSummary = npsByMonth.get(m) ?? null;
    const monthNpsRows = npsRows.filter((r) => r.month === m);
    const monthNpsResponded = monthNpsRows.filter((r) => r.rating !== null);
    const ratingCount = (rating: number) => monthNpsResponded.filter((r) => r.rating === rating).length;
    const totalSurvey = monthNpsResponded.length;

    const npsDistribution = [
      { key: '5', label: 'Rating 5 (5-Star)', quantity: ratingCount(5), pct: totalSurvey > 0 ? Math.round((ratingCount(5) / totalSurvey) * 1000) / 10 : 0 },
      { key: '4', label: 'Rating 4 (4-Star)', quantity: ratingCount(4), pct: totalSurvey > 0 ? Math.round((ratingCount(4) / totalSurvey) * 1000) / 10 : 0 },
      { key: '3', label: 'Rating 3 (3-Star)', quantity: ratingCount(3), pct: totalSurvey > 0 ? Math.round((ratingCount(3) / totalSurvey) * 1000) / 10 : 0 },
      { key: '2', label: 'Rating 2 (2-Star)', quantity: ratingCount(2), pct: totalSurvey > 0 ? Math.round((ratingCount(2) / totalSurvey) * 1000) / 10 : 0 },
      { key: '1', label: 'Rating 1 (1-Star)', quantity: ratingCount(1), pct: totalSurvey > 0 ? Math.round((ratingCount(1) / totalSurvey) * 1000) / 10 : 0 },
    ];
    const hasNpsData = totalSurvey > 0;
    const nps = monthNpsSummary?.npsScore ?? 0;

    // Real per-channel (IVR vs WhatsApp) survey performance — genuinely
    // trackable now that the NPS importer persists callType per response.
    const npsByChannelMap = groupNpsBy(monthNpsRows, (r) => r.callType || 'Unknown');
    const npsByChannel = Array.from(npsByChannelMap.entries()).map(([channel, summary]) => ({ channel, ...summary }));

    const diag = woCount > 0 ? Math.round((1 - mismatchBouncedCount / woCount) * 1000) / 10 : 0;

    const isYesVal = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      const str = String(val).trim().toLowerCase();
      return str === 'yes' || str === 'y' || str === '1' || str === 'true';
    };

    const isSmartOrTablet = (r: any): boolean => {
      const mt = String(r.rawData[FIELD_MAP.modelType] || r.rawData['Model type'] || r.rawData['Model Type'] || '').toLowerCase();
      const m = String(r.rawData[FIELD_MAP.model] || '').toLowerCase();
      return !mt.includes('feature') && !m.includes('feature') && !m.includes('hero') && !m.includes('captain');
    };

    const sahSmartRows = mRows.filter((r) => r.isHome && isSmartOrTablet(r));

    const pcbaRows = sahSmartRows.filter((r) => r.leakageValue > 0 && isYesVal(r.rawData[FIELD_MAP.pcbaConsumption] || r.rawData['PCBA Consumption']));
    const tpLcdRows = sahSmartRows.filter((r) => r.leakageValue > 0 && isYesVal(r.rawData[FIELD_MAP.tpLcdConsumption] || r.rawData['TP/LCD Consumption']));

    // 60-day repeat: WOs where the same IMEI was serviced within 60 days of a prior call.
    // Cost = Total Part Cost of this (the repeat) call, attributed to the 1st repairer and
    // bucketed into the repeat call's own month.
    const repeat60dRows = sahSmartRows.filter((r) => r.isRepeat60d);
    const rwrRows = sahSmartRows.filter((r) => {
      const act = String(r.rawData['Action Code Desc'] || r.rawData['Action Taken'] || '').toLowerCase();
      const sym = String(r.rawData[FIELD_MAP.symptomDesc] || '').toLowerCase();
      return act.includes('rwr') || act.includes('return without') || sym.includes('rwr');
    });
    const sah15kmRows = sahSmartRows.filter((r) => r.tat !== null && r.tat <= 1 && (r.isPCBA || r.isLCD));
    const travelRows = sahSmartRows.filter((r) => r.leakageValue > 0 && r.travelVal > 0);

    const parseNum = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      const cleaned = String(val).replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const calcSumCost = (rows: any[], valFieldKey: string, fallbackPrice: number) => {
      const q = rows.length;
      let c = Math.round(rows.reduce((sum, r) => {
        const p = parseNum(r.rawData[valFieldKey]);
        return sum + (p > 0 ? p : fallbackPrice);
      }, 0));
      return { qty: q, cost: c };
    };

    const pcbaData = calcSumCost(pcbaRows, FIELD_MAP.pcbaValue, 1800);
    const tpLcdData = calcSumCost(tpLcdRows, FIELD_MAP.tpLcdValue, 1200);

    const repeat60dQty = repeat60dRows.length;
    const repeat60dCost = Math.round(repeat60dRows.reduce((sum, r) => {
      // Total Part Cost of this (the repeat) call — attributed to the 1st repairer
      const raw = r.rawData;
      const totalPart = parseNum(raw[FIELD_MAP.totalPartValue] || raw['Total Part Value']);
      if (totalPart > 0) return sum + totalPart;
      // Fallback: sum component values if total is absent
      const fallback = parseNum(raw[FIELD_MAP.pcbaValue] || 0)
        + parseNum(raw[FIELD_MAP.tpLcdValue] || 0)
        + parseNum(raw[FIELD_MAP.batteryValue] || 0)
        + parseNum(raw[FIELD_MAP.subPcbaValue] || 0)
        + parseNum(raw[FIELD_MAP.accessoriesValue] || 0)
        + parseNum(raw[FIELD_MAP.othersValue] || 0);
      return sum + fallback;
    }, 0));

    const rwrQty = rwrRows.length;
    const rwrCost = rwrQty * 200;

    const sah15kmQty = sah15kmRows.length;
    const sah15kmCost = sah15kmQty * 300;

    const travelQty = travelRows.length;
    const travelCost = travelQty * 500;

    const breakdown = [
      { key: 'pcba', label: 'PCBA', quantity: pcbaData.qty, cost: pcbaData.cost },
      { key: 'lcd', label: 'TP/LCD', quantity: tpLcdData.qty, cost: tpLcdData.cost },
      { key: 'sah_15km', label: 'Same-Day S@H Travel (>15km each side)', quantity: sah15kmQty, cost: sah15kmCost },
      { key: 'repeat_60d_parts', label: '60-Day Repeat Repair Parts (Attributed 1st Repairer)', quantity: repeat60dQty, cost: repeat60dCost },
      { key: 'rwr_fee', label: 'S@H Return Without Repair (RWR ₹200 Fee)', quantity: rwrQty, cost: rwrCost },
      { key: 'travel', label: 'Technician Home Travel Fee', quantity: travelQty, cost: travelCost },
    ];

    const leak = breakdown.reduce((sum, item) => sum + item.cost, 0);

    // Model-level part consumption aggregation for month m
    const modelMap = new Map<string, { model: string; count: number; totalPartCost: number }>();

    mRows.forEach((r) => {
      const rawModel = r.model || String(r.rawData[FIELD_MAP.model] || '').trim();
      const modelName = rawModel && rawModel !== '' ? rawModel : 'Unspecified Model';
      const partCost = (r as any).cpcPartVal || 0;

      const existing = modelMap.get(modelName) || { model: modelName, count: 0, totalPartCost: 0 };
      existing.count += 1;
      existing.totalPartCost += partCost;
      modelMap.set(modelName, existing);
    });

    const modelConsumption = Array.from(modelMap.values())
      .map((item) => {
        const avgPartCost = item.count > 0 ? Math.round(item.totalPartCost / item.count) : 0;
        return {
          model: item.model,
          count: item.count,
          totalPartCost: Math.round(item.totalPartCost),
          avgPartCost,
        };
      })
      .sort((a, b) => b.totalPartCost - a.totalPartCost);

    return {
      month: m,
      wo: woCount,
      ftfr,
      mttr,
      nps,
      npsSent: monthNpsSummary?.sent ?? 0,
      npsResponseRate: monthNpsSummary?.responseRate ?? 0,
      npsByChannel,
      diag,
      leak,
      breakdown,
      tatDistribution,
      npsDistribution,
      hasNpsData,
      modelConsumption,
      _leakparts: { pcba: pcbaData.qty, lcd: tpLcdData.qty },
      _leaktravel: travelQty,
      bounce: bounceCount,
      detractor: detractorCount,
      d: { ftfr: 0, mttr: 0, nps: 0, diag: 0, leak: 0 } as any, // populated below
    };
  });

  // Calculate monthly KPI delta changes
  kpiMonths.forEach((cur, index) => {
    if (index === 0) {
      cur.d = { ftfr: null, mttr: null, nps: null, diag: null, leak: null };
    } else {
      const prev = kpiMonths[index - 1]!;
      cur.d = {
        ftfr: Math.round((cur.ftfr - prev.ftfr) * 10) / 10,
        mttr: Math.round((cur.mttr - prev.mttr) * 100) / 100,
        nps: Math.round((cur.nps - prev.nps) * 10) / 10,
        diag: Math.round((cur.diag - prev.diag) * 10) / 10,
        leak: cur.leak - prev.leak,
      };
    }
  });

  // Overall KPI averages
  const overallWo = processedRows.length;
  const overallBounce = processedRows.filter((r) => r.isBounce).length;
  const overallMismatchBounced = processedRows.filter((r) => r.isMismatchBounced).length;

  // Real detractor count and NPS score across every survey response on file
  // (all months, all devices combined).
  const overallNpsSummary = summarizeNps(npsRows);
  const overallDetractor = npsRows.filter((r) => r.rating !== null && r.rating <= 2).length;

  const overallFtfr = overallWo > 0 ? Math.round((1 - overallBounce / overallWo) * 1000) / 10 : 0;

  const overallTatRows = processedRows.filter((r) => r.tat !== null);
  const overallMttr = overallTatRows.length > 0 ? Math.round((overallTatRows.reduce((sum, r) => sum + r.tat!, 0) / overallTatRows.length) * 100) / 100 : 0;

  const overallDiag = overallWo > 0 ? Math.round((1 - overallMismatchBounced / overallWo) * 1000) / 10 : 0;

  const overallPcbaParts = processedRows.filter((r) => r.isPCBA && (r.isGhost || r.isHomeBoard)).length;
  const overallLcdParts = processedRows.filter((r) => r.isLCD && (r.isGhost || r.isHomeBoard)).length;
  const overallTravelCount = processedRows.filter((r) => r.isHome && r.isBounce).length;
  const overallLeak = overallPcbaParts * 1800 + overallLcdParts * 1200 + overallTravelCount * 750;

  const kpi = {
    months: kpiMonths,
    overall: {
      ftfr: overallFtfr,
      mttr: overallMttr,
      nps: overallNpsSummary?.npsScore ?? 0,
      diag: overallDiag,
      leak: overallLeak,
      _leakparts: { pcba: overallPcbaParts, lcd: overallLcdParts },
      _leaktravel: overallTravelCount,
      bounce: overallBounce,
      detractor: overallDetractor,
    },
    // No NPS target: no business-approved benchmark exists for this metric
    // yet (unlike ftfr/mttr/diag, which are established process targets).
    targets: { ftfr: 85, mttr: 2.0, diag: 98 },
  };

  // 5. Hierarchy build (BUSM -> ASM -> ASPs)
  const hier: Record<string, Record<string, string[]>> = {};
  const busmList = new Set<string>();
  const asmList = new Set<string>();
  const aspList = new Set<string>();

  processedRows.forEach((r) => {
    busmList.add(r.busm);
    asmList.add(r.asm);
    aspList.add(r.asp);

    hier[r.busm] = hier[r.busm] || {};
    hier[r.busm]![r.asm] = hier[r.busm]![r.asm] || [];
    if (!hier[r.busm]![r.asm]!.includes(r.asp)) {
      hier[r.busm]![r.asm]!.push(r.asp);
    }
  });

  // Helper to compile actor score summaries grouped by actor + month
  function compileActorStats(levelKey: 'busm' | 'asm' | 'asp'): any[] {
    const groups = new Map<string, any[]>();
    processedRows.forEach((r) => {
      const actorName = r[levelKey];
      const key = `${actorName}:${r.month}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    });

    return Array.from(groups.entries()).map(([key, rows]) => {
      const [actor, month] = key.split(':');
      const woCount = rows.length;

      const totalProcess = rows.reduce((sum, r) => sum + r.processScore, 0);
      const totalSkill = rows.reduce((sum, r) => sum + r.skillScore, 0);
      const totalAudit = rows.reduce((sum, r) => sum + r.auditScore, 0);

      const ghost = rows.filter((r) => r.isGhost).length;
      const home_board = rows.filter((r) => r.isHomeBoard).length;
      const cross = rows.filter((r) => r.isCrossAsp).length;
      const bounce = rows.filter((r) => r.isBounce).length;
      const mismatch = rows.filter((r) => r.isMismatch).length;
      const mismatch_bounced = rows.filter((r) => r.isMismatchBounced).length;
      const detractor = rows.filter((r) => r.isDetractor).length;
      const doa = rows.filter((r) => r.isDOA).length;

      // Unique IMEIs cross ASP in month
      const crossDevIMEIs = new Set(rows.filter((r) => r.isCrossAsp).map((r) => String(r.rawData[FIELD_MAP.imei] || '')));
      
      const home_bounce = rows.filter((r) => r.isHomeBoard && r.isBounce).length;

      const ghostPCBA = rows.filter((r) => r.isGhost && r.isPCBA).length;
      const ghostLCD = rows.filter((r) => r.isGhost && r.isLCD).length;
      
      const homePCBA = rows.filter((r) => r.isHomeBoard && r.isPCBA).length;
      const homeLCD = rows.filter((r) => r.isHomeBoard && r.isLCD).length;

      return {
        actor,
        month,
        wo: woCount,
        // Real hierarchy context — needed by the frontend to filter ASPs by
        // their parent ASM/BUSM (e.g. the Org KPI "ASP Centre Performance"
        // table). code is only meaningful at the 'asp' level.
        code: levelKey === 'asp' ? (rows[0]?.aspCode || '') : undefined,
        busm: rows[0]?.busm,
        asm: rows[0]?.asm,
        process: safeDivide(totalProcess, woCount),
        skill:   safeDivide(totalSkill,   woCount),
        audit:   safeDivide(totalAudit,   woCount),
        ghost,
        cross,
        home_board,
        bounce,
        mismatch,
        mismatch_bounced,
        detractor,
        doa,
        cross_dev: crossDevIMEIs.size,
        home_bounce,
        ghostfam: { pcba: ghostPCBA, lcd: ghostLCD, batt: 0, cam: 0, spk: 0, chg: 0, oth: 0 },
        homefam: { pcba: homePCBA, lcd: homeLCD, batt: 0, cam: 0, spk: 0, chg: 0, oth: 0 },
        conf: woCount >= 30 ? 'OK' : 'LOW',
      };
    });
  }

  const busmStats = compileActorStats('busm');
  const asmStats = compileActorStats('asm');
  const aspStats = compileActorStats('asp');

  // 5b. Score Card v2 — Skill / Process / Audit, each a composite of metrics
  // already tracked elsewhere, combined via NATIONAL percentile rank (ASP vs
  // every other ASP that month) rather than the old per-row 100-minus-penalty
  // formula. Computed at ASP-month granularity, then rolled up to ASM/BUSM as
  // a WO-weighted average of their constituent ASPs — replaces .process/
  // .skill/.audit on busmStats/asmStats/aspStats below (all other fields on
  // those rows — ghost/home_board/cross/etc — are untouched, still used by
  // the Coaching tab's threshold system).
  //
  //   Skill   = avg( FTFR, MTTR(inv), CPC(inv), Repeat-rate(inv) )         — "fixed right, fast, cheap, for good"
  //   Process = avg( TAT 1-2 day closure %, S@H cancel %(inv),
  //                  S@H reschedule %(inv), MSM Achievement % )            — operational discipline
  //   Audit   = avg( Compliance QC/ELS/DEF pass %, NPS, Leakage-flag rate(inv) ) — trust / independent verification
  //   Overall = avg( Skill, Process, Audit )
  //
  // Every metric that has no data for an ASP that month is simply left out
  // of that ASP's average (not defaulted to 0/100) rather than penalizing or
  // rewarding absence of data.
  const scIdsWithData = [...new Set(processedRows.map((r) => r.serviceCentreId).filter(Boolean))];

  const [msmRowsRaw, qcRowsRaw, elsRowsRaw, defRowsRaw] = await Promise.all([
    prisma.msmDailyRecord.findMany({ where: { serviceCentreId: { in: scIdsWithData } }, select: { serviceCentreId: true, month: true, complianceStatus: true } }),
    prisma.complianceQcRecord.findMany({ where: { serviceCentreId: { in: scIdsWithData } }, select: { serviceCentreId: true, month: true, complianceStatus: true } }),
    prisma.complianceElsDoaRecord.findMany({ where: { serviceCentreId: { in: scIdsWithData } }, select: { serviceCentreId: true, month: true, complianceStatus: true } }),
    prisma.complianceDefectiveSpareRecord.findMany({ where: { serviceCentreId: { in: scIdsWithData } }, select: { serviceCentreId: true, month: true, complianceStatus: true } }),
  ]);

  const isCompliant = (status: string | null) => (status || '').trim().toLowerCase() === 'compliance';

  // Pooled compliant/total counts per (serviceCentreId, month), null status
  // rows (MSM non-working days) excluded from both numerator and denominator.
  function buildComplianceCounts(rows: { serviceCentreId: string; month: string | null; complianceStatus: string | null }[]) {
    const map = new Map<string, { compliant: number; total: number }>();
    rows.forEach((r) => {
      if (r.complianceStatus === null || r.month === null) return;
      const key = `${r.serviceCentreId}:${r.month}`;
      const cur = map.get(key) || { compliant: 0, total: 0 };
      cur.total += 1;
      if (isCompliant(r.complianceStatus)) cur.compliant += 1;
      map.set(key, cur);
    });
    return map;
  }

  const msmCounts = buildComplianceCounts(msmRowsRaw);
  const qcCounts = buildComplianceCounts(qcRowsRaw);
  const elsCounts = buildComplianceCounts(elsRowsRaw);
  const defCounts = buildComplianceCounts(defRowsRaw);

  function pctFrom(map: Map<string, { compliant: number; total: number }>, key: string): number | null {
    const e = map.get(key);
    return e && e.total > 0 ? (e.compliant / e.total) * 100 : null;
  }

  // Pooled QC + ELS + DEF into one Compliance pass-rate (weighted by each
  // sub-check's own record count, not a naive average of 3 percentages).
  function compliancePctFor(key: string): number | null {
    const parts = [qcCounts.get(key), elsCounts.get(key), defCounts.get(key)].filter(Boolean) as { compliant: number; total: number }[];
    if (parts.length === 0) return null;
    const compliant = parts.reduce((s, p) => s + p.compliant, 0);
    const total = parts.reduce((s, p) => s + p.total, 0);
    return total > 0 ? (compliant / total) * 100 : null;
  }

  interface AspMonthRaw {
    asp: string; asm: string; busm: string; month: string; wo: number;
    ftfr: number; mttr: number | null; cpc: number; repeatRate: number;
    tatClosurePct: number | null; sahCancelPct: number; sahReschedulePct: number; sahCombinedPct: number;
    msmPct: number | null; compliancePct: number | null; npsPct: number | null; leakageRate: number; diagPct: number;
  }

  const aspMonthGroups = new Map<string, typeof processedRows>();
  processedRows.forEach((r) => {
    const key = `${r.asp}|||${r.month}`;
    if (!aspMonthGroups.has(key)) aspMonthGroups.set(key, []);
    aspMonthGroups.get(key)!.push(r);
  });

  // Real per-ASP-month NPS score, from the actual survey dataset (not
  // Master Data's dormant npsRating column).
  const npsByAspMonth = groupNpsBy(npsRows, (r) => `${r.aspName}|||${r.month}`);

  const aspMonthRaw: AspMonthRaw[] = [];
  aspMonthGroups.forEach((rows) => {
    const asp = rows[0]!.asp;
    const month = rows[0]!.month;
    const wo = rows.length;
    const scId = rows.find((r) => r.serviceCentreId)?.serviceCentreId || '';
    const complianceKey = `${scId}:${month}`;

    const bounceCount = rows.filter((r) => r.isBounce).length;
    const ftfr = wo > 0 ? (1 - bounceCount / wo) * 100 : 0;
    const repeatRate = wo > 0 ? (bounceCount / wo) * 100 : 0;

    const tatRows = rows.filter((r) => r.tat !== null && r.tat !== undefined);
    const mttr = tatRows.length > 0 ? tatRows.reduce((s, r) => s + (r.tat as number), 0) / tatRows.length : null;
    const c1d2d = tatRows.filter((r) => (r.tat as number) <= 1).length;
    const tatClosurePct = tatRows.length > 0 ? (c1d2d / tatRows.length) * 100 : null;

    const totalPartVal = rows.reduce((s, r) => s + (r.cpcPartVal || 0), 0);
    const cpc = wo > 0 ? totalPartVal / wo : 0;

    const cancelCount = rows.filter((r) => r.isBounce || r.isDetractor || (r.flag && r.flag.includes('cancel'))).length;
    const sahCancelPct = wo > 0 ? (cancelCount / wo) * 100 : 0;
    const rescheduleCount = rows.filter((r) => r.tat !== null && r.tat !== undefined && (r.tat as number) > 3).length;
    const sahReschedulePct = wo > 0 ? (rescheduleCount / wo) * 100 : 0;
    const sahCombinedPct = wo > 0 ? ((cancelCount + rescheduleCount) / wo) * 100 : 0;

    const npsPct = npsByAspMonth.get(`${asp}|||${month}`)?.npsScore ?? null;

    const leakageCount = rows.filter((r) => r.isGhost || r.isHomeBoard || r.isCrossAsp).length;
    const leakageRate = wo > 0 ? (leakageCount / wo) * 100 : 0;

    const mismatchBouncedCount = rows.filter((r) => r.isMismatchBounced).length;
    const diagPct = wo > 0 ? (1 - mismatchBouncedCount / wo) * 100 : 0;

    aspMonthRaw.push({
      asp, asm: rows[0]!.asm, busm: rows[0]!.busm, month, wo,
      ftfr, mttr, cpc, repeatRate,
      tatClosurePct, sahCancelPct, sahReschedulePct, sahCombinedPct,
      msmPct: pctFrom(msmCounts, complianceKey),
      compliancePct: compliancePctFor(complianceKey),
      npsPct,
      leakageRate,
      diagPct,
    });
  });

  // National percentile rank: what fraction of this month's ASP cohort does
  // this ASP perform equal-to-or-better than, after orienting "better" as
  // "higher" (metrics where lower is better are inverted via higherIsBetter=false).
  function percentileRank(values: number[], value: number, higherIsBetter: boolean): number {
    const n = values.length;
    if (n <= 1) return 100;
    const countNoBetter = higherIsBetter ? values.filter((v) => v <= value).length : values.filter((v) => v >= value).length;
    return (countNoBetter / n) * 100;
  }

  function rankMetric(rowsForMonth: AspMonthRaw[], getter: (r: AspMonthRaw) => number | null, higherIsBetter: boolean): Map<string, number> {
    const withValues = rowsForMonth.map((r) => ({ asp: r.asp, v: getter(r) })).filter((x): x is { asp: string; v: number } => x.v !== null);
    const values = withValues.map((x) => x.v);
    const out = new Map<string, number>();
    withValues.forEach((x) => out.set(x.asp, percentileRank(values, x.v, higherIsBetter)));
    return out;
  }

  interface AspMonthScore { asp: string; asm: string; busm: string; month: string; wo: number; skill: number | null; process: number | null; audit: number | null; overall: number | null; }
  const aspMonthScores: AspMonthScore[] = [];

  // Child-metric detail (real value + real percentile rank + real national
  // average) per ASP-month, for every metric that feeds the Skill/Process/
  // Audit composite scores above — kept alongside the composite so the Score
  // Card tab's per-metric breakdown tables can show genuine numbers instead
  // of re-deriving their own placeholder formulas.
  interface ChildMetricDetail { value: number | null; rank: number | null; national: number | null }
  const childMetricsByAspMonth = new Map<string, Record<string, ChildMetricDetail>>();

  uniqueMonths.forEach((month) => {
    const monthRows = aspMonthRaw.filter((r) => r.month === month);
    if (monthRows.length === 0) return;

    const ftfrRank = rankMetric(monthRows, (r) => r.ftfr, true);
    const mttrRank = rankMetric(monthRows, (r) => r.mttr, false);
    const cpcRank = rankMetric(monthRows, (r) => r.cpc, false);
    const repeatRank = rankMetric(monthRows, (r) => r.repeatRate, false);

    const tatRank = rankMetric(monthRows, (r) => r.tatClosurePct, true);
    const cancelRank = rankMetric(monthRows, (r) => r.sahCancelPct, false);
    const rescheduleRank = rankMetric(monthRows, (r) => r.sahReschedulePct, false);
    const combinedRank = rankMetric(monthRows, (r) => r.sahCombinedPct, false);
    const msmRank = rankMetric(monthRows, (r) => r.msmPct, true);

    const complianceRank = rankMetric(monthRows, (r) => r.compliancePct, true);
    const npsRank = rankMetric(monthRows, (r) => r.npsPct, true);
    const leakageRank = rankMetric(monthRows, (r) => r.leakageRate, false);
    // Diagnostic Accuracy — exposed as a child metric for the Org KPI ASP
    // table, not part of the Skill/Process/Audit composite (that composite's
    // methodology is fixed; this is tracked as its own Executive KPI).
    const diagRank = rankMetric(monthRows, (r) => r.diagPct, true);

    const avgOf = (asp: string, maps: Map<string, number>[]): number | null => {
      const vals = maps.map((m) => m.get(asp)).filter((v): v is number => v !== undefined);
      return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    };

    // Real national average — WO-weighted mean of the raw metric value across
    // every ASP reporting that month (never a hardcoded constant).
    const nationalAvg = (getter: (r: AspMonthRaw) => number | null): number | null => {
      const items = monthRows.map((r) => ({ v: getter(r), w: r.wo }));
      const valid = items.filter((x): x is { v: number; w: number } => x.v !== null);
      const totalW = valid.reduce((s, x) => s + x.w, 0);
      return totalW > 0 ? valid.reduce((s, x) => s + x.v * x.w, 0) / totalW : null;
    };

    const metricDefs: { key: string; getter: (r: AspMonthRaw) => number | null; rank: Map<string, number> }[] = [
      { key: 'ftfr', getter: (r) => r.ftfr, rank: ftfrRank },
      { key: 'mttr', getter: (r) => r.mttr, rank: mttrRank },
      { key: 'cpc', getter: (r) => r.cpc, rank: cpcRank },
      { key: 'repeatRate', getter: (r) => r.repeatRate, rank: repeatRank },
      { key: 'tatClosurePct', getter: (r) => r.tatClosurePct, rank: tatRank },
      { key: 'sahCombinedPct', getter: (r) => r.sahCombinedPct, rank: combinedRank },
      { key: 'msmPct', getter: (r) => r.msmPct, rank: msmRank },
      { key: 'compliancePct', getter: (r) => r.compliancePct, rank: complianceRank },
      { key: 'npsPct', getter: (r) => r.npsPct, rank: npsRank },
      { key: 'leakageRate', getter: (r) => r.leakageRate, rank: leakageRank },
      { key: 'diagPct', getter: (r) => r.diagPct, rank: diagRank },
    ];
    const nationalByKey = new Map(metricDefs.map((m) => [m.key, nationalAvg(m.getter)]));

    monthRows.forEach((r) => {
      const skill = avgOf(r.asp, [ftfrRank, mttrRank, cpcRank, repeatRank]);
      const process = avgOf(r.asp, [tatRank, cancelRank, rescheduleRank, msmRank]);
      const audit = avgOf(r.asp, [complianceRank, npsRank, leakageRank]);
      const parts = [skill, process, audit].filter((v): v is number => v !== null);
      const overall = parts.length > 0 ? parts.reduce((s, v) => s + v, 0) / parts.length : null;
      aspMonthScores.push({ asp: r.asp, asm: r.asm, busm: r.busm, month: r.month, wo: r.wo, skill, process, audit, overall });

      const detail: Record<string, ChildMetricDetail> = {};
      metricDefs.forEach((m) => {
        detail[m.key] = {
          value: m.getter(r),
          rank: m.rank.get(r.asp) ?? null,
          national: nationalByKey.get(m.key) ?? null,
        };
      });
      childMetricsByAspMonth.set(`${r.asp}:${r.month}`, detail);
    });
  });

  // Roll up ASP scores to ASM and BUSM as a WO-weighted average.
  function weightedAvg(items: { v: number | null; w: number }[]): number | null {
    const valid = items.filter((x) => x.v !== null) as { v: number; w: number }[];
    const totalW = valid.reduce((s, x) => s + x.w, 0);
    if (totalW === 0) return null;
    return valid.reduce((s, x) => s + x.v * x.w, 0) / totalW;
  }

  function rollup(groupKeyFn: (s: AspMonthScore) => string): Map<string, { skill: number | null; process: number | null; audit: number | null; overall: number | null }> {
    const groups = new Map<string, AspMonthScore[]>();
    aspMonthScores.forEach((s) => {
      const key = `${groupKeyFn(s)}:${s.month}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    });
    const out = new Map<string, { skill: number | null; process: number | null; audit: number | null; overall: number | null }>();
    groups.forEach((items, key) => {
      out.set(key, {
        skill: weightedAvg(items.map((i) => ({ v: i.skill, w: i.wo }))),
        process: weightedAvg(items.map((i) => ({ v: i.process, w: i.wo }))),
        audit: weightedAvg(items.map((i) => ({ v: i.audit, w: i.wo }))),
        overall: weightedAvg(items.map((i) => ({ v: i.overall, w: i.wo }))),
      });
    });
    return out;
  }

  const aspScoreByKey = new Map(aspMonthScores.map((s) => [`${s.asp}:${s.month}`, s]));
  const asmScoreByKey = rollup((s) => s.asm);
  const busmScoreByKey = rollup((s) => s.busm);

  const round1 = (v: number | null) => (v === null ? null : Math.round(v * 10) / 10);

  // Roll up child-metric detail (value + percentile rank) to ASM/BUSM as a
  // WO-weighted average of their constituent ASPs' real numbers — same
  // methodology as the composite skill/process/audit rollup above. The
  // national average is a single figure per month, so it just passes through
  // from any constituent ASP rather than being re-averaged.
  const childMetricKeys = ['ftfr', 'mttr', 'cpc', 'repeatRate', 'tatClosurePct', 'sahCombinedPct', 'msmPct', 'compliancePct', 'npsPct', 'leakageRate', 'diagPct'];

  function rollupChildMetrics(groupKeyFn: (s: AspMonthScore) => string): Map<string, Record<string, ChildMetricDetail>> {
    const groups = new Map<string, AspMonthScore[]>();
    aspMonthScores.forEach((s) => {
      const key = `${groupKeyFn(s)}:${s.month}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    });
    const out = new Map<string, Record<string, ChildMetricDetail>>();
    groups.forEach((items, key) => {
      const detail: Record<string, ChildMetricDetail> = {};
      childMetricKeys.forEach((mk) => {
        const zipped = items.map((it) => ({ w: it.wo, cm: childMetricsByAspMonth.get(`${it.asp}:${it.month}`)?.[mk] }));
        const valueValid = zipped.filter((z): z is { w: number; cm: ChildMetricDetail } => z.cm !== undefined && z.cm.value !== null);
        const rankValid = zipped.filter((z): z is { w: number; cm: ChildMetricDetail } => z.cm !== undefined && z.cm.rank !== null);
        const totalVW = valueValid.reduce((s2, z) => s2 + z.w, 0);
        const totalRW = rankValid.reduce((s2, z) => s2 + z.w, 0);
        const value = totalVW > 0 ? valueValid.reduce((s2, z) => s2 + (z.cm.value as number) * z.w, 0) / totalVW : null;
        const rank = totalRW > 0 ? rankValid.reduce((s2, z) => s2 + (z.cm.rank as number) * z.w, 0) / totalRW : null;
        const national = zipped.find((z) => z.cm && z.cm.national !== null)?.cm?.national ?? null;
        detail[mk] = { value: round1(value), rank: round1(rank), national: round1(national) };
      });
      out.set(key, detail);
    });
    return out;
  }

  const asmChildMetricsByKey = rollupChildMetrics((s) => s.asm);
  const busmChildMetricsByKey = rollupChildMetrics((s) => s.busm);

  aspStats.forEach((row: any) => {
    const s = aspScoreByKey.get(`${row.actor}:${row.month}`);
    row.skill = round1(s?.skill ?? null);
    row.process = round1(s?.process ?? null);
    row.audit = round1(s?.audit ?? null);
    row.overall = round1(s?.overall ?? null);
    const cm = childMetricsByAspMonth.get(`${row.actor}:${row.month}`);
    row.childMetrics = cm
      ? Object.fromEntries(childMetricKeys.map((mk) => [mk, { value: round1(cm[mk]?.value ?? null), rank: round1(cm[mk]?.rank ?? null), national: round1(cm[mk]?.national ?? null) }]))
      : {};
  });
  asmStats.forEach((row: any) => {
    const s = asmScoreByKey.get(`${row.actor}:${row.month}`);
    row.skill = round1(s?.skill ?? null);
    row.process = round1(s?.process ?? null);
    row.audit = round1(s?.audit ?? null);
    row.overall = round1(s?.overall ?? null);
    row.childMetrics = asmChildMetricsByKey.get(`${row.actor}:${row.month}`) ?? {};
  });
  busmStats.forEach((row: any) => {
    const s = busmScoreByKey.get(`${row.actor}:${row.month}`);
    row.skill = round1(s?.skill ?? null);
    row.process = round1(s?.process ?? null);
    row.audit = round1(s?.audit ?? null);
    row.overall = round1(s?.overall ?? null);
    row.childMetrics = busmChildMetricsByKey.get(`${row.actor}:${row.month}`) ?? {};
  });

  // 6. Evidence table: all flagged rows (limited to 5000 max to keep payload light)
  const evidence = processedRows
    .filter((r) => r.flag !== '')
    .map((r) => ({
      row: r.row,
      wo: r.wo,
      flag: r.flag,
      asp: r.asp,
      asm: r.asm,
      busm: r.busm,
      city: r.city,
      created: r.created,
      delivered: r.delivered,
      month: r.month,
      model: r.model,
      symptom: r.symptom,
      action: r.action,
      part: r.part,
      tat: r.tat,
    }));

  // 7. DATA.coaching cards & outlier thresholds
  const coachingLevels = ['asm', 'asp', 'busm'] as const;
  const coaching: any = {};

  coachingLevels.forEach((lvl) => {
    const levelStats = lvl === 'asm' ? asmStats : lvl === 'asp' ? aspStats : busmStats;
    const actorNames = [...new Set(levelStats.map((r) => r.actor))];

    // Compute threshold stats for level (based on qualifying actors with wo >= 100)
    const indicators = ['ghost', 'home_board', 'cross', 'bounce', 'mismatch', 'detractor', 'doa'] as const;
    const thresholds: any = {};

    indicators.forEach((ind) => {
      // Calculate rate as a percentage of total workorders per actor
      const actorRates: { actor: string; rate: number; count: number; total: number }[] = [];

      actorNames.forEach((actName) => {
        const actRows = levelStats.filter((r) => r.actor === actName);
        const totalWo = actRows.reduce((sum, r) => sum + r.wo, 0);
        if (totalWo >= 100) {
          const fieldKey = ind === 'ghost' ? 'ghost' : 
                           ind === 'home_board' ? 'home_board' : 
                           ind === 'cross' ? 'cross' : 
                           ind === 'bounce' ? 'bounce' : 
                           ind === 'mismatch' ? 'mismatch' : 
                           ind === 'detractor' ? 'detractor' : 'doa';
          const flagSum = actRows.reduce((sum, r) => sum + (r[fieldKey] ?? 0), 0);
          actorRates.push({
            actor: actName,
            rate: Math.round((flagSum / totalWo) * 1000) / 10,
            count: flagSum,
            total: totalWo,
          });
        }
      });

      const ratesOnly = actorRates.map((r) => r.rate);
      const mean = ratesOnly.length > 0 ? Math.round((ratesOnly.reduce((sum, r) => sum + r, 0) / ratesOnly.length) * 10) / 10 : 0;
      const sd = ratesOnly.length > 0 ? Math.round(getStdDev(ratesOnly, mean) * 10) / 10 : 0;
      const strict = Math.round((mean + 2 * sd) * 10) / 10;
      const p90 = Math.round(getPercentile(ratesOnly, 90) * 10) / 10;

      const overStrict = actorRates.filter((r) => r.rate >= strict).map((r) => ({ asm: r.actor, rate: r.rate }));
      const overP90 = actorRates.filter((r) => r.rate >= p90).map((r) => ({ asm: r.actor, rate: r.rate }));

      const labelMap = {
        ghost: 'Same-day board swap (walk-in)',
        home_board: 'Board repair at home',
        cross: 'Cross-ASP IMEI',
        bounce: 'Repeat bounces',
        mismatch: 'Symptom-action mismatches',
        detractor: 'NPS detractors (1-3)',
        doa: 'DOA cases',
      };

      thresholds[ind] = {
        indicator: labelMap[ind],
        mean,
        sd,
        strict,
        p90,
        over_strict: overStrict,
        over_p90: overP90,
      };
    });

    // Compute coaching cards per actor
    const cards: any = {};
    actorNames.forEach((actName) => {
      const actRows = levelStats.filter((r) => r.actor === actName);
      const totalWo = actRows.reduce((sum, r) => sum + r.wo, 0);

      const ghost = actRows.reduce((sum, r) => sum + r.ghost, 0);
      const home = actRows.reduce((sum, r) => sum + r.home_board, 0);
      const cross = actRows.reduce((sum, r) => sum + r.cross, 0);
      const bounce = actRows.reduce((sum, r) => sum + r.bounce, 0);
      const mmb = actRows.reduce((sum, r) => sum + r.mismatch_bounced, 0);
      const det = actRows.reduce((sum, r) => sum + r.detractor, 0);
      const doa = actRows.reduce((sum, r) => sum + r.doa, 0);

      const trend = actRows.map((r) => ({
        month: r.month,
        audit: r.audit,
        skill: r.skill,
        process: r.process,
      }));

      // Calculate Percentiles vs peers (for qualifying actors)
      const peers = actorNames.map((peerName) => {
        const peerRows = levelStats.filter((r) => r.actor === peerName);
        const peerWo = peerRows.reduce((sum, r) => sum + r.wo, 0);
        return {
          name: peerName,
          wo: peerWo,
          audit: peerWo > 0 ? peerRows.reduce((sum, r) => sum + r.audit * r.wo, 0) / peerWo : 0,
          skill: peerWo > 0 ? peerRows.reduce((sum, r) => sum + r.skill * r.wo, 0) / peerWo : 0,
          process: peerWo > 0 ? peerRows.reduce((sum, r) => sum + r.process * r.wo, 0) / peerWo : 0,
        };
      }).filter((p) => p.wo >= 30);

      const getPercentileRank = (val: number, key: 'audit' | 'skill' | 'process') => {
        const sortedPeers = peers.map((p) => p[key]).sort((a, b) => a - b);
        const index = sortedPeers.indexOf(val);
        if (index === -1 || sortedPeers.length <= 1) return 50;
        return Math.round((index / (sortedPeers.length - 1)) * 100);
      };

      const actorAuditAvg = totalWo > 0 ? actRows.reduce((sum, r) => sum + r.audit * r.wo, 0) / totalWo : 0;
      const actorSkillAvg = totalWo > 0 ? actRows.reduce((sum, r) => sum + r.skill * r.wo, 0) / totalWo : 0;
      const actorProcessAvg = totalWo > 0 ? actRows.reduce((sum, r) => sum + r.process * r.wo, 0) / totalWo : 0;

      const qualifies = totalWo >= 30;
      const pct = qualifies ? {
        audit: getPercentileRank(actorAuditAvg, 'audit'),
        skill: getPercentileRank(actorSkillAvg, 'skill'),
        process: getPercentileRank(actorProcessAvg, 'process'),
      } : { audit: 50, skill: 50, process: 50 };

      // Nominate check (exceeds P90 on any flag, and has count >= 3)
      let nominate = false;
      const t = thresholds;
      if (qualifies) {
        const checkMap = [
          { key: 'ghost', val: ghost, p90: t.ghost.p90 },
          { key: 'home_board', val: home, p90: t.home_board.p90 },
          { key: 'cross', val: cross, p90: t.cross.p90 },
          { key: 'bounce', val: bounce, p90: t.bounce.p90 },
          { key: 'mismatch', val: mmb, p90: t.mismatch.p90 }, // use mmb for mismatch thresholds
        ];
        nominate = checkMap.some((c) => (c.val / totalWo * 100) >= c.p90 && c.val >= 3);
      }

      // Dynamic talking points list
      const talkingPoints: { sev: 'high' | 'mid' | 'low'; text: string }[] = [];
      if (ghost > 0) {
        talkingPoints.push({
          sev: (ghost / totalWo * 100) >= t.ghost.p90 ? 'high' : 'mid',
          text: `Billed ${ghost} walk-in board swaps (PCBA/LCD) closed on the same day. Address the stock and part-return registry.`,
        });
      }
      if (home > 0) {
        talkingPoints.push({
          sev: (home / totalWo * 100) >= t.home_board.p90 ? 'high' : 'mid',
          text: `Logged ${home} board-level repairs (PCBA/LCD) under doorstep home-visits, in contradiction of Lava's return-to-ASP policy.`,
        });
      }
      if (bounce > 0) {
        talkingPoints.push({
          sev: (bounce / totalWo * 100) >= t.bounce.p90 ? 'high' : 'mid',
          text: `Repeat bounce rate of ${Math.round(bounce / totalWo * 100)}% indicates a technical diagnostic accuracy gap.`,
        });
      }
      if (talkingPoints.length === 0) {
        talkingPoints.push({
          sev: 'low',
          text: 'Performing consistently on target compared to the cohort average. Keep up the high service standards.',
        });
      }

      const cohortMean = {
        audit: peers.length > 0 ? peers.reduce((sum, p) => sum + p.audit, 0) / peers.length : 0,
        skill: peers.length > 0 ? peers.reduce((sum, p) => sum + p.skill, 0) / peers.length : 0,
        process: peers.length > 0 ? peers.reduce((sum, p) => sum + p.process, 0) / peers.length : 0,
      };

      cards[actName] = {
        wo: totalWo,
        qualifies,
        pct,
        flags: { ghost, home, cross, bounce, mmb, det, doa },
        nominate,
        talking_points: talkingPoints,
        trend,
        cohort_mean: cohortMean,
      };
    });

    coaching[lvl] = {
      cards,
      thresholds,
    };
  });

  // Attach any cached coaching narratives (see coachingNarrative.service.ts) — an
  // optional synthesized paragraph shown above the rule-based talking points.
  // One batch query across all levels/actors rather than N+1 per card.
  const cachedNarratives = await prisma.coachingNarrative.findMany({
    select: { level: true, actor: true, narrative: true },
  });
  const narrativeByKey = new Map(cachedNarratives.map((n) => [`${n.level}:${n.actor}`, n.narrative]));
  coachingLevels.forEach((lvl) => {
    Object.entries(coaching[lvl].cards).forEach(([actorName, card]: [string, any]) => {
      card.narrative = narrativeByKey.get(`${lvl}:${actorName}`) ?? null;
    });
  });

  // Calculate home integrity panel stats for Insights tab
  const homeBoardTotal = processedRows.filter((r) => r.isHomeBoard).length;
  const homeVisitsTotal = processedRows.filter((r) => {
    const raw = r.rawData as any;
    return String(raw[FIELD_MAP.callType] || raw[FIELD_MAP.callCategory] || '').toLowerCase().includes('home');
  }).length;
  const pctOfHome = homeVisitsTotal > 0 ? Math.round((homeBoardTotal / homeVisitsTotal) * 1000) / 10 : 0;
  
  const pcbaAtHome = processedRows.filter((r) => r.isHomeBoard && r.isPCBA).length;
  const lcdAtHome = processedRows.filter((r) => r.isHomeBoard && r.isLCD).length;
  
  const customerHomeVisits = new Map<string, number>();
  processedRows.filter((r) => {
    const raw = r.rawData as any;
    return String(raw[FIELD_MAP.callType] || raw[FIELD_MAP.callCategory] || '').toLowerCase().includes('home');
  }).forEach((r) => {
    const imei = String(r.rawData[FIELD_MAP.imei] || '');
    if (imei) {
      customerHomeVisits.set(imei, (customerHomeVisits.get(imei) || 0) + 1);
    }
  });
  const homeRepeatCust = Array.from(customerHomeVisits.values()).filter((c) => c >= 3).length;

  // Total workorder calls per ASP
  const aspCallsMap = new Map<string, number>();
  processedRows.forEach((r) => {
    aspCallsMap.set(r.asp, (aspCallsMap.get(r.asp) || 0) + 1);
  });

  // Top ASPs for board-at-home
  const aspHomeCounts = new Map<string, { code: string; asp: string; asm: string; busm: string; totalCalls: number; n: number; sameDayCount: number; sameDayPct: number; sameDayToCallsPct: number }>();
  processedRows.filter((r) => r.isHomeBoard).forEach((r) => {
    const isSameDay = r.tat === 0 || (Boolean(r.created) && r.created === r.delivered);
    const totCalls = aspCallsMap.get(r.asp) || 0;
    const countObj = aspHomeCounts.get(r.asp) || { code: r.aspCode || '', asp: r.asp, asm: r.asm, busm: r.busm, totalCalls: totCalls, n: 0, sameDayCount: 0, sameDayPct: 0, sameDayToCallsPct: 0 };
    countObj.n++;
    if (isSameDay) countObj.sameDayCount++;
    countObj.sameDayPct = countObj.n > 0 ? Number(((countObj.sameDayCount / countObj.n) * 100).toFixed(1)) : 0;
    countObj.sameDayToCallsPct = countObj.totalCalls > 0 ? Number(((countObj.sameDayCount / countObj.totalCalls) * 100).toFixed(1)) : 0;
    aspHomeCounts.set(r.asp, countObj);
  });
  const topAsps = Array.from(aspHomeCounts.values()).sort((a, b) => b.n - a.n);

  // Top models for board-at-home
  const modelHomeCounts = new Map<string, number>();
  processedRows.filter((r) => r.isHomeBoard).forEach((r) => {
    modelHomeCounts.set(r.model, (modelHomeCounts.get(r.model) || 0) + 1);
  });
  const topModels = Array.from(modelHomeCounts.entries()).map(([model, n]) => ({ model, n })).sort((a, b) => b.n - a.n).slice(0, 10);

  // Top actions for board-at-home
  const actionHomeCounts = new Map<string, number>();
  processedRows.filter((r) => r.isHomeBoard).forEach((r) => {
    actionHomeCounts.set(r.action, (actionHomeCounts.get(r.action) || 0) + 1);
  });
  const topActions = Array.from(actionHomeCounts.entries()).map(([action, n]) => ({ action, n })).sort((a, b) => b.n - a.n).slice(0, 10);

  // Monthly breakdown for Doorstep Board-at-Home
  const homeByMonth: Record<string, { board_at_home: number; pct_of_home: number; pcba_at_home: number; lcd_at_home: number; top_asps: { code: string; asp: string; asm: string; busm: string; totalCalls: number; n: number; sameDayCount: number; sameDayPct: number; sameDayToCallsPct: number }[]; top_models: { model: string; n: number }[]; top_actions: { action: string; n: number }[] }> = {};
  
  const allHomeMonths = Array.from(new Set(processedRows.map((r) => r.month))).filter(Boolean);
  allHomeMonths.forEach((m) => {
    const monthRows = processedRows.filter((r) => r.month === m);
    const mHomeTotal = monthRows.filter((r) => r.isHome).length;
    const mHomeBoardRows = monthRows.filter((r) => r.isHomeBoard);
    const mBoardTotal = mHomeBoardRows.length;
    const mPct = mHomeTotal > 0 ? Number(((mBoardTotal / mHomeTotal) * 100).toFixed(1)) : 0;
    const mPcba = mHomeBoardRows.filter((r) => r.isPCBA).length;
    const mLcd = mHomeBoardRows.filter((r) => r.isLCD).length;

    const mAspCallsMap = new Map<string, number>();
    monthRows.forEach((r) => {
      mAspCallsMap.set(r.asp, (mAspCallsMap.get(r.asp) || 0) + 1);
    });

    const mAspMap = new Map<string, { code: string; asp: string; asm: string; busm: string; totalCalls: number; n: number; sameDayCount: number; sameDayPct: number; sameDayToCallsPct: number }>();
    mHomeBoardRows.forEach((r) => {
      const isSameDay = r.tat === 0 || (Boolean(r.created) && r.created === r.delivered);
      const totCalls = mAspCallsMap.get(r.asp) || 0;
      const c = mAspMap.get(r.asp) || { code: r.aspCode || '', asp: r.asp, asm: r.asm, busm: r.busm, totalCalls: totCalls, n: 0, sameDayCount: 0, sameDayPct: 0, sameDayToCallsPct: 0 };
      c.n++;
      if (isSameDay) c.sameDayCount++;
      c.sameDayPct = c.n > 0 ? Number(((c.sameDayCount / c.n) * 100).toFixed(1)) : 0;
      c.sameDayToCallsPct = c.totalCalls > 0 ? Number(((c.sameDayCount / c.totalCalls) * 100).toFixed(1)) : 0;
      mAspMap.set(r.asp, c);
    });
    const mTopAsps = Array.from(mAspMap.values()).sort((a, b) => b.n - a.n);

    const mModelMap = new Map<string, number>();
    mHomeBoardRows.forEach((r) => mModelMap.set(r.model, (mModelMap.get(r.model) || 0) + 1));
    const mTopModels = Array.from(mModelMap.entries()).map(([model, n]) => ({ model, n })).sort((a, b) => b.n - a.n).slice(0, 5);

    const mActionMap = new Map<string, number>();
    mHomeBoardRows.forEach((r) => mActionMap.set(r.action, (mActionMap.get(r.action) || 0) + 1));
    const mTopActions = Array.from(mActionMap.entries()).map(([action, n]) => ({ action, n })).sort((a, b) => b.n - a.n).slice(0, 5);

    homeByMonth[m] = {
      board_at_home: mBoardTotal,
      pct_of_home: mPct,
      pcba_at_home: mPcba,
      lcd_at_home: mLcd,
      top_asps: mTopAsps,
      top_models: mTopModels,
      top_actions: mTopActions,
    };
  });

  const home = {
    board_at_home: homeBoardTotal,
    pct_of_home: pctOfHome,
    pcba_at_home: pcbaAtHome,
    lcd_at_home: lcdAtHome,
    home_repeat_cust: homeRepeatCust,
    top_asps: topAsps,
    top_models: topModels,
    top_actions: topActions,
    by_month: homeByMonth,
  };

  // 8. Organization KPIs — BUSM and ASM Performance & Ranking Matrix
  function computeOrgKpiTable(rows: any[]) {
    // rows may be a single month's slice or every month combined (see call
    // sites below) — scope the real NPS data to whichever months are
    // actually present so per-BUSM/ASM/national NPS stays consistent with
    // whatever period this call is summarizing.
    const rowMonths = new Set(rows.map((r) => r.month));
    const scopedNpsRows = npsRows.filter((r) => rowMonths.has(r.month));
    const npsByBusmScoped = groupNpsBy(scopedNpsRows, (r) => r.busmName);
    const npsByAsmScoped = groupNpsBy(scopedNpsRows, (r) => r.asmName);
    const npsNationalScoped = summarizeNps(scopedNpsRows);
    // 1. Group by BUSM
    const busmMap = new Map<string, any[]>();
    rows.forEach((r) => {
      const b = r.busm || 'Unknown';
      if (!b || b === 'Unknown' || b.toLowerCase().includes('unknown')) return;
      if (!busmMap.has(b)) busmMap.set(b, []);
      busmMap.get(b)!.push(r);
    });

    const busmList = Array.from(busmMap.entries()).map(([busmName, busmRows]) => {
      const wo = busmRows.length;
      const bounceCount = busmRows.filter((r) => r.isBounce).length;
      const mismatchBouncedCount = busmRows.filter((r) => r.isMismatchBounced).length;

      const tatRows = busmRows.filter((r) => r.tat !== null);
      const tat1d = tatRows.filter((r) => r.tat! <= 1).length;
      const tatPct = tatRows.length > 0 ? Math.round((tat1d / tatRows.length) * 1000) / 10 : (wo > 0 ? Math.round((1 - bounceCount / wo) * 1000) / 10 : 0);

      const totalPartVal = busmRows.reduce((sum, r) => sum + (r.cpcPartVal || 0), 0);
      const busmRepairRows = busmRows.filter((r) => (r.cpcPartVal || 0) > 0);
      const busmReplRows = busmRows.filter((r) => r.isReplacement || String(r.rawData?.[FIELD_MAP.callType] || '').trim().toUpperCase() === 'Z9');
      const busmCombinedCost = totalPartVal + busmReplRows.reduce((sum, r) => sum + (r.handsetVal || 0), 0);
      const busmCpcWos = busmRepairRows.length + busmReplRows.length;
      const cpc = busmCpcWos > 0 ? Math.round(busmCombinedCost / busmCpcWos) : 0;

      const homeRows = busmRows.filter((r) => r.isHome);
      const homeAdherence = homeRows.filter((r) => r.tat !== null && r.tat <= 3).length;
      const sahPct = homeRows.length > 0 ? Math.round((homeAdherence / homeRows.length) * 1000) / 10 : 0;

      const npsPct = npsByBusmScoped.get(busmName)?.npsScore ?? 0;

      const diagPct = wo > 0 ? Math.round((1 - mismatchBouncedCount / wo) * 1000) / 10 : 0;

      const avgProcess = wo > 0 ? busmRows.reduce((sum, r) => sum + r.processScore, 0) / wo : 0;
      const avgSkill = wo > 0 ? busmRows.reduce((sum, r) => sum + r.skillScore, 0) / wo : 0;
      const avgAudit = wo > 0 ? busmRows.reduce((sum, r) => sum + r.auditScore, 0) / wo : 0;
      const cagPct = Math.round(((avgProcess + avgSkill + avgAudit) / 3) * 10) / 10;

      const cancelCount = busmRows.filter((r) => r.isBounce || r.isDetractor || (r.flag && r.flag.includes('cancel'))).length;
      const cancelPct = wo > 0 ? Math.round((cancelCount / wo) * 1000) / 10 : 0;

      const rescheduleCount = busmRows.filter((r) => r.tat !== null && r.tat > 3).length;
      const reschedulePct = wo > 0 ? Math.round((rescheduleCount / wo) * 1000) / 10 : 0;

      const sameDayAttendCount = busmRows.filter((r) => r.tat !== null && r.tat <= 1).length;
      const sameDayAttendPct = wo > 0 ? Math.round((sameDayAttendCount / wo) * 1000) / 10 : 0;

      const sameDayAttendCancelCount = busmRows.filter((r) => r.tat !== null && r.tat <= 1 && (r.isBounce || r.isMismatch)).length;
      const sameDayAttendCancelPct = sameDayAttendCount > 0 ? Math.round((sameDayAttendCancelCount / sameDayAttendCount) * 1000) / 10 : 0;

      const pendingCount = busmRows.filter((r) => r.tat === null).length;
      const pendingToAttendPct = wo > 0 ? Math.round((pendingCount / wo) * 1000) / 10 : 0;

      const tatValidRows = busmRows.filter((r) => r.tat !== null && r.tat !== undefined);
      let c1d = tatValidRows.filter((r) => r.tat <= 1).length;
      let c2d = tatValidRows.filter((r) => r.tat === 2).length;
      let c3d = tatValidRows.filter((r) => r.tat === 3 || r.tat === 4).length;
      let c5d = tatValidRows.filter((r) => r.tat >= 5).length;
      let cStillOpen = busmRows.filter((r) => r.tat === null || r.tat === undefined).length;

      // No hardcoded distribution fallback: if a BUSM genuinely has zero
      // rows with a known TAT that month, its closure buckets are honestly
      // 0/0/0/0 with everything counted as still-open — not a synthetic
      // split that looks like real data.
      const tat1dPct = wo > 0 ? Math.round((c1d / wo) * 1000) / 10 : 0;
      const tat2dPct = wo > 0 ? Math.round((c2d / wo) * 1000) / 10 : 0;
      const tat3dPct = wo > 0 ? Math.round((c3d / wo) * 1000) / 10 : 0;
      const tat5dPct = wo > 0 ? Math.round((c5d / wo) * 1000) / 10 : 0;
      const stillOpenPct = wo > 0 ? Math.round((cStillOpen / wo) * 1000) / 10 : 0;

      // CPC breakdown (for Section 2 drilldown — same rows as the `cpc` value above)
      const busmRepairTotal = Math.round(busmRepairRows.reduce((s, r) => s + (r.cpcPartVal || 0), 0));
      const busmRepairAvg = busmRepairRows.length > 0 ? Math.round(busmRepairTotal / busmRepairRows.length) : 0;
      const busmReplTotal = Math.round(busmReplRows.reduce((s, r) => s + (r.handsetVal || 0), 0));
      const busmReplAvg = busmReplRows.length > 0 ? Math.round(busmReplTotal / busmReplRows.length) : 0;

      // S@H home-visit breakdown (for Section 3 drilldown — from Master Data isHome rows)
      const sahTotalCount = homeRows.length;
      const sahSameDayCount = homeRows.filter((r) => r.tat !== null && r.tat <= 1).length;
      const sahCancelCount = homeRows.filter((r) => r.isBounce).length;
      const sahReschedCount = homeRows.filter((r) => r.tat !== null && r.tat > 3 && !r.isBounce).length;
      const sahSameDayCancelCount = homeRows.filter((r) => r.tat !== null && r.tat <= 1 && r.isBounce).length;
      const sahPendingCount = homeRows.filter((r) => r.tat === null).length;
      const fp = (n: number, d: number) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '0.0%';
      const sahBreakdown = {
        total: sahTotalCount,
        cancel: fp(sahCancelCount, sahTotalCount),
        resched: fp(sahReschedCount, sahTotalCount),
        same_day: fp(sahSameDayCount, sahTotalCount),
        same_day_cancel: fp(sahSameDayCancelCount, sahSameDayCount),
        pending: fp(sahPendingCount, sahTotalCount),
      };

      return {
        name: busmName,
        wo,
        tat: tatPct,
        cpc,
        sah: sahPct,
        nps: npsPct,
        diag: diagPct,
        cag: cagPct,
        repair_count: busmRepairRows.length,
        repair_total: busmRepairTotal,
        repair_avg: busmRepairAvg,
        repl_count: busmReplRows.length,
        repl_total: busmReplTotal,
        repl_avg: busmReplAvg,
        combined_total: Math.round(busmCombinedCost),
        sahBreakdown,
        cancelPct,
        reschedulePct,
        sameDayAttendPct,
        sameDayAttendCancelPct,
        pendingToAttendPct,
        tatClosure: {
          c1d, tat1dPct,
          c2d, tat2dPct,
          c3d, tat3dPct,
          c5d, tat5dPct,
          cStillOpen, stillOpenPct
        }
      };
    });

    const rankBy = (arr: any[], valFn: (x: any) => number, ascending = false) => {
      const sorted = [...arr].sort((a, b) => ascending ? valFn(a) - valFn(b) : valFn(b) - valFn(a));
      const rankMap = new Map<string, number>();
      sorted.forEach((item, idx) => rankMap.set(item.name, idx + 1));
      return rankMap;
    };

    const tatRanks = rankBy(busmList, (x) => x.tat);
    const cpcRanks = rankBy(busmList, (x) => x.cpc, true);
    const sahRanks = rankBy(busmList, (x) => x.sah);
    const npsRanks = rankBy(busmList, (x) => x.nps);
    const diagRanks = rankBy(busmList, (x) => x.diag);
    const cagRanks = rankBy(busmList, (x) => x.cag);

    const rankedBusms = busmList.map((item) => ({
      ...item,
      ranks: {
        tat: tatRanks.get(item.name) || 1,
        cpc: cpcRanks.get(item.name) || 1,
        sah: sahRanks.get(item.name) || 1,
        nps: npsRanks.get(item.name) || 1,
        diag: diagRanks.get(item.name) || 1,
        cag: cagRanks.get(item.name) || 1,
      },
    }));

    // 2. Group by ASM
    const asmMap = new Map<string, { busm: string; rows: any[] }>();
    rows.forEach((r) => {
      const a = r.asm || 'Unknown';
      if (!a || a === 'Unknown' || a.toLowerCase().includes('unknown')) return;
      if (!asmMap.has(a)) asmMap.set(a, { busm: r.busm || 'Unknown', rows: [] });
      asmMap.get(a)!.rows.push(r);
    });

    const asmList = Array.from(asmMap.entries()).map(([asmName, obj]) => {
      const asmRows = obj.rows;
      const wo = asmRows.length;
      const bounceCount = asmRows.filter((r) => r.isBounce).length;
      const mismatchBouncedCount = asmRows.filter((r) => r.isMismatchBounced).length;

      const tatRows = asmRows.filter((r) => r.tat !== null);
      const tat1d = tatRows.filter((r) => r.tat! <= 1).length;
      const tatPct = tatRows.length > 0 ? Math.round((tat1d / tatRows.length) * 1000) / 10 : (wo > 0 ? Math.round((1 - bounceCount / wo) * 1000) / 10 : 0);

      const totalPartVal = asmRows.reduce((sum, r) => sum + (r.cpcPartVal || 0), 0);
      const asmRepairRows = asmRows.filter((r) => (r.cpcPartVal || 0) > 0);
      const asmReplRows = asmRows.filter((r) => r.isReplacement || String(r.rawData?.[FIELD_MAP.callType] || '').trim().toUpperCase() === 'Z9');
      const asmCombinedCost = totalPartVal + asmReplRows.reduce((sum, r) => sum + (r.handsetVal || 0), 0);
      const asmCpcWos = asmRepairRows.length + asmReplRows.length;
      const cpc = asmCpcWos > 0 ? Math.round(asmCombinedCost / asmCpcWos) : 0;

      const homeRows = asmRows.filter((r) => r.isHome);
      const homeAdherence = homeRows.filter((r) => r.tat !== null && r.tat <= 3).length;
      const sahPct = homeRows.length > 0 ? Math.round((homeAdherence / homeRows.length) * 1000) / 10 : 0;

      const npsPct = npsByAsmScoped.get(asmName)?.npsScore ?? 0;

      const diagPct = wo > 0 ? Math.round((1 - mismatchBouncedCount / wo) * 1000) / 10 : 0;

      const avgProcess = wo > 0 ? asmRows.reduce((sum, r) => sum + r.processScore, 0) / wo : 0;
      const avgSkill = wo > 0 ? asmRows.reduce((sum, r) => sum + r.skillScore, 0) / wo : 0;
      const avgAudit = wo > 0 ? asmRows.reduce((sum, r) => sum + r.auditScore, 0) / wo : 0;
      const cagPct = Math.round(((avgProcess + avgSkill + avgAudit) / 3) * 10) / 10;

      const cancelCount = asmRows.filter((r) => r.isBounce || r.isDetractor || (r.flag && r.flag.includes('cancel'))).length;
      const cancelPct = wo > 0 ? Math.round((cancelCount / wo) * 1000) / 10 : 0;

      const rescheduleCount = asmRows.filter((r) => r.tat !== null && r.tat > 3).length;
      const reschedulePct = wo > 0 ? Math.round((rescheduleCount / wo) * 1000) / 10 : 0;

      const sameDayAttendCount = asmRows.filter((r) => r.tat !== null && r.tat <= 1).length;
      const sameDayAttendPct = wo > 0 ? Math.round((sameDayAttendCount / wo) * 1000) / 10 : 0;

      const sameDayAttendCancelCount = asmRows.filter((r) => r.tat !== null && r.tat <= 1 && (r.isBounce || r.isMismatch)).length;
      const sameDayAttendCancelPct = sameDayAttendCount > 0 ? Math.round((sameDayAttendCancelCount / sameDayAttendCount) * 1000) / 10 : 0;

      const pendingCount = asmRows.filter((r) => r.tat === null).length;
      const pendingToAttendPct = wo > 0 ? Math.round((pendingCount / wo) * 1000) / 10 : 0;

      const tatValidRows = asmRows.filter((r) => r.tat !== null && r.tat !== undefined);
      let c1d = tatValidRows.filter((r) => r.tat <= 1).length;
      let c2d = tatValidRows.filter((r) => r.tat === 2).length;
      let c3d = tatValidRows.filter((r) => r.tat === 3 || r.tat === 4).length;
      let c5d = tatValidRows.filter((r) => r.tat >= 5).length;
      let cStillOpen = asmRows.filter((r) => r.tat === null || r.tat === undefined).length;

      // No hardcoded distribution fallback — see BUSM-level note above.
      const tat1dPct = wo > 0 ? Math.round((c1d / wo) * 1000) / 10 : 0;
      const tat2dPct = wo > 0 ? Math.round((c2d / wo) * 1000) / 10 : 0;
      const tat3dPct = wo > 0 ? Math.round((c3d / wo) * 1000) / 10 : 0;
      const tat5dPct = wo > 0 ? Math.round((c5d / wo) * 1000) / 10 : 0;
      const stillOpenPct = wo > 0 ? Math.round((cStillOpen / wo) * 1000) / 10 : 0;

      // CPC breakdown (for Section 2 ASM drilldown)
      const asmRepairTotal = Math.round(asmRepairRows.reduce((s, r) => s + (r.cpcPartVal || 0), 0));
      const asmRepairAvg = asmRepairRows.length > 0 ? Math.round(asmRepairTotal / asmRepairRows.length) : 0;
      const asmReplTotal = Math.round(asmReplRows.reduce((s, r) => s + (r.handsetVal || 0), 0));
      const asmReplAvg = asmReplRows.length > 0 ? Math.round(asmReplTotal / asmReplRows.length) : 0;

      // S@H home-visit breakdown (for Section 3 ASM drilldown)
      const asmSahTotalCount = homeRows.length;
      const asmSahSdCount = homeRows.filter((r) => r.tat !== null && r.tat <= 1).length;
      const asmFp = (n: number, d: number) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '0.0%';
      const asmSahBreakdown = {
        total: asmSahTotalCount,
        cancel: asmFp(homeRows.filter((r) => r.isBounce).length, asmSahTotalCount),
        resched: asmFp(homeRows.filter((r) => r.tat !== null && r.tat > 3 && !r.isBounce).length, asmSahTotalCount),
        same_day: asmFp(asmSahSdCount, asmSahTotalCount),
        same_day_cancel: asmFp(homeRows.filter((r) => r.tat !== null && r.tat <= 1 && r.isBounce).length, asmSahSdCount),
        pending: asmFp(homeRows.filter((r) => r.tat === null).length, asmSahTotalCount),
      };

      return {
        name: asmName,
        busm: obj.busm,
        wo,
        tat: tatPct,
        cpc,
        sah: sahPct,
        nps: npsPct,
        diag: diagPct,
        cag: cagPct,
        repair_count: asmRepairRows.length,
        repair_total: asmRepairTotal,
        repair_avg: asmRepairAvg,
        repl_count: asmReplRows.length,
        repl_total: asmReplTotal,
        repl_avg: asmReplAvg,
        combined_total: Math.round(asmCombinedCost),
        sahBreakdown: asmSahBreakdown,
        cancelPct,
        reschedulePct,
        sameDayAttendPct,
        sameDayAttendCancelPct,
        pendingToAttendPct,
        tatClosure: {
          c1d, tat1dPct,
          c2d, tat2dPct,
          c3d, tat3dPct,
          c5d, tat5dPct,
          cStillOpen, stillOpenPct
        }
      };
    });

    const asmTatRanks = rankBy(asmList, (x) => x.tat);
    const asmCpcRanks = rankBy(asmList, (x) => x.cpc, true);
    const asmSahRanks = rankBy(asmList, (x) => x.sah);
    const asmNpsRanks = rankBy(asmList, (x) => x.nps);
    const asmDiagRanks = rankBy(asmList, (x) => x.diag);
    const asmCagRanks = rankBy(asmList, (x) => x.cag);

    const rankedAsms = asmList.map((item) => ({
      ...item,
      ranks: {
        tat: asmTatRanks.get(item.name) || 1,
        cpc: asmCpcRanks.get(item.name) || 1,
        sah: asmSahRanks.get(item.name) || 1,
        nps: asmNpsRanks.get(item.name) || 1,
        diag: asmDiagRanks.get(item.name) || 1,
        cag: asmCagRanks.get(item.name) || 1,
      },
    }));

    // 3. Group by ASP — real per-ASP TAT closure, replacing the frontend's
    // previous synthetic allocation (a national/BUSM distribution applied
    // proportionally to a static ASP list, not derived from this ASP's own
    // work orders at all). Kept deliberately minimal (just what the ASP-level
    // TAT table needs) rather than duplicating every BUSM/ASM-level metric.
    const aspMap = new Map<string, { code: string; asm: string; busm: string; rows: any[] }>();
    rows.forEach((r) => {
      const name = r.asp || 'Unknown';
      if (!name || name === 'Unknown' || name.toLowerCase().includes('unknown')) return;
      if (!r.asm || r.asm.toLowerCase().includes('unknown')) return;
      if (!aspMap.has(name)) aspMap.set(name, { code: r.aspCode || '', asm: r.asm, busm: r.busm || 'Unknown', rows: [] });
      aspMap.get(name)!.rows.push(r);
    });

    const aspList = Array.from(aspMap.entries()).map(([aspName, obj]) => {
      const aspRows = obj.rows;
      const wo = aspRows.length;

      const tatValidRows = aspRows.filter((r) => r.tat !== null && r.tat !== undefined);
      const c1d = tatValidRows.filter((r) => r.tat <= 1).length;
      const c2d = tatValidRows.filter((r) => r.tat === 2).length;
      const c3d = tatValidRows.filter((r) => r.tat === 3 || r.tat === 4).length;
      const c5d = tatValidRows.filter((r) => r.tat >= 5).length;
      const cStillOpen = aspRows.filter((r) => r.tat === null || r.tat === undefined).length;

      // No hardcoded distribution fallback — an ASP with zero known-TAT
      // rows this month honestly shows 0/0/0/0, not a synthetic split.
      const tat1dPct = wo > 0 ? Math.round((c1d / wo) * 1000) / 10 : 0;
      const tat2dPct = wo > 0 ? Math.round((c2d / wo) * 1000) / 10 : 0;
      const tat3dPct = wo > 0 ? Math.round((c3d / wo) * 1000) / 10 : 0;
      const tat5dPct = wo > 0 ? Math.round((c5d / wo) * 1000) / 10 : 0;
      const stillOpenPct = wo > 0 ? Math.round((cStillOpen / wo) * 1000) / 10 : 0;

      // CPC breakdown (for Section 2 ASP drilldown)
      const aspRepairRows = aspRows.filter((r) => (r.cpcPartVal || 0) > 0);
      const aspReplRows = aspRows.filter((r) => r.isReplacement || String(r.rawData?.[FIELD_MAP.callType] || '').trim().toUpperCase() === 'Z9');
      const aspRepairTotal = Math.round(aspRepairRows.reduce((s, r) => s + (r.cpcPartVal || 0), 0));
      const aspRepairAvg = aspRepairRows.length > 0 ? Math.round(aspRepairTotal / aspRepairRows.length) : 0;
      const aspReplTotal = Math.round(aspReplRows.reduce((s, r) => s + (r.handsetVal || 0), 0));
      const aspReplAvg = aspReplRows.length > 0 ? Math.round(aspReplTotal / aspReplRows.length) : 0;
      const aspCombinedCost = aspRows.reduce((s, r) => s + (r.cpcPartVal || 0), 0) + aspReplTotal;

      // S@H breakdown for ASP (for Section 3 ASP drilldown)
      const aspHomeRows = aspRows.filter((r) => r.isHome);
      const aspSahTotal = aspHomeRows.length;
      const aspSahSdCount = aspHomeRows.filter((r) => r.tat !== null && r.tat <= 1).length;
      const aspFp = (n: number, d: number) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '0.0%';
      const aspSahBreakdown = {
        total: aspSahTotal,
        cancel: aspFp(aspHomeRows.filter((r) => r.isBounce).length, aspSahTotal),
        resched: aspFp(aspHomeRows.filter((r) => r.tat !== null && r.tat > 3 && !r.isBounce).length, aspSahTotal),
        same_day: aspFp(aspSahSdCount, aspSahTotal),
        same_day_cancel: aspFp(aspHomeRows.filter((r) => r.tat !== null && r.tat <= 1 && r.isBounce).length, aspSahSdCount),
        pending: aspFp(aspHomeRows.filter((r) => r.tat === null).length, aspSahTotal),
      };

      return {
        code: obj.code,
        name: aspName,
        asp: aspName,
        asm: obj.asm,
        busm: obj.busm,
        wo,
        repair_count: aspRepairRows.length,
        repair_total: aspRepairTotal,
        repair_avg: aspRepairAvg,
        repl_count: aspReplRows.length,
        repl_total: aspReplTotal,
        repl_avg: aspReplAvg,
        combined_total: Math.round(aspCombinedCost),
        sahBreakdown: aspSahBreakdown,
        tatClosure: {
          c1d, tat1dPct,
          c2d, tat2dPct,
          c3d, tat3dPct,
          c5d, tat5dPct,
          cStillOpen, stillOpenPct
        }
      };
    });

    // National Summary Row
    const totalWo = rows.length;
    const totalBounce = rows.filter((r) => r.isBounce).length;
    const totalMismatchBounced = rows.filter((r) => r.isMismatchBounced).length;

    const totalTatRows = rows.filter((r) => r.tat !== null);
    const totalTat1d = totalTatRows.filter((r) => r.tat! <= 1).length;
    const nationalTat = totalTatRows.length > 0 ? Math.round((totalTat1d / totalTatRows.length) * 1000) / 10 : 0;

    const totalPartVal = rows.reduce((sum, r) => sum + (r.cpcPartVal || 0), 0);
    const natRepairRows = rows.filter((r) => (r.cpcPartVal || 0) > 0);
    const natReplRows = rows.filter((r) => r.isReplacement || String(r.rawData?.[FIELD_MAP.callType] || '').trim().toUpperCase() === 'Z9');
    const natCombinedCost = totalPartVal + natReplRows.reduce((sum, r) => sum + (r.handsetVal || 0), 0);
    const natCpcWos = natRepairRows.length + natReplRows.length;
    const nationalCpc = natCpcWos > 0 ? Math.round(natCombinedCost / natCpcWos) : 0;

    const totalHomeRows = rows.filter((r) => r.isHome);
    const totalHomeAdherence = totalHomeRows.filter((r) => r.tat !== null && r.tat <= 3).length;
    const nationalSah = totalHomeRows.length > 0 ? Math.round((totalHomeAdherence / totalHomeRows.length) * 1000) / 10 : 0;

    const nationalNps = npsNationalScoped?.npsScore ?? 0;

    const nationalDiag = totalWo > 0 ? Math.round((1 - totalMismatchBounced / totalWo) * 1000) / 10 : 0;

    const totalAvgProcess = totalWo > 0 ? rows.reduce((sum, r) => sum + r.processScore, 0) / totalWo : 0;
    const totalAvgSkill = totalWo > 0 ? rows.reduce((sum, r) => sum + r.skillScore, 0) / totalWo : 0;
    const totalAvgAudit = totalWo > 0 ? rows.reduce((sum, r) => sum + r.auditScore, 0) / totalWo : 0;
    const nationalCag = Math.round(((totalAvgProcess + totalAvgSkill + totalAvgAudit) / 3) * 10) / 10;

    const natTatValidRows = rows.filter((r) => r.tat !== null && r.tat !== undefined);
    let natC1d = natTatValidRows.filter((r) => r.tat <= 1).length;
    let natC2d = natTatValidRows.filter((r) => r.tat === 2).length;
    let natC3d = natTatValidRows.filter((r) => r.tat === 3 || r.tat === 4).length;
    let natC5d = natTatValidRows.filter((r) => r.tat >= 5).length;
    let natStillOpen = rows.filter((r) => r.tat === null || r.tat === undefined).length;

    // No hardcoded distribution fallback — see BUSM-level note above.
    const natTat1dPct = totalWo > 0 ? Math.round((natC1d / totalWo) * 1000) / 10 : 0;
    const natTat2dPct = totalWo > 0 ? Math.round((natC2d / totalWo) * 1000) / 10 : 0;
    const natTat3dPct = totalWo > 0 ? Math.round((natC3d / totalWo) * 1000) / 10 : 0;
    const natTat5dPct = totalWo > 0 ? Math.round((natC5d / totalWo) * 1000) / 10 : 0;
    const natStillOpenPct = totalWo > 0 ? Math.round((natStillOpen / totalWo) * 1000) / 10 : 0;

    // National CPC breakdown
    const natRepairTotal = Math.round(natRepairRows.reduce((s, r) => s + (r.cpcPartVal || 0), 0));
    const natRepairAvg = natRepairRows.length > 0 ? Math.round(natRepairTotal / natRepairRows.length) : 0;
    const natReplTotal = Math.round(natReplRows.reduce((s, r) => s + (r.handsetVal || 0), 0));
    const natReplAvg = natReplRows.length > 0 ? Math.round(natReplTotal / natReplRows.length) : 0;

    // National S@H breakdown
    const natSahTotalCount = totalHomeRows.length;
    const natSahSdCount = totalHomeRows.filter((r) => r.tat !== null && r.tat <= 1).length;
    const natFp = (n: number, d: number) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '0.0%';
    const natSahBreakdown = {
      total: natSahTotalCount,
      cancel: natFp(totalHomeRows.filter((r) => r.isBounce).length, natSahTotalCount),
      resched: natFp(totalHomeRows.filter((r) => r.tat !== null && r.tat > 3 && !r.isBounce).length, natSahTotalCount),
      same_day: natFp(natSahSdCount, natSahTotalCount),
      same_day_cancel: natFp(totalHomeRows.filter((r) => r.tat !== null && r.tat <= 1 && r.isBounce).length, natSahSdCount),
      pending: natFp(totalHomeRows.filter((r) => r.tat === null).length, natSahTotalCount),
    };

    const nationalSummary = {
      name: 'National %',
      wo: totalWo,
      tat: nationalTat,
      cpc: nationalCpc,
      sah: nationalSah,
      nps: nationalNps,
      diag: nationalDiag,
      cag: nationalCag,
      repair_count: natRepairRows.length,
      repair_total: natRepairTotal,
      repair_avg: natRepairAvg,
      repl_count: natReplRows.length,
      repl_total: natReplTotal,
      repl_avg: natReplAvg,
      combined_total: Math.round(natCombinedCost),
      sahBreakdown: natSahBreakdown,
      // Aggregate operational metrics from BUSM list (computed from real data, not hardcoded)
      cancelPct: busmList.length > 0 ? Math.round(busmList.reduce((s, b) => s + (b.cancelPct || 0), 0) / busmList.length * 10) / 10 : 0,
      reschedulePct: busmList.length > 0 ? Math.round(busmList.reduce((s, b) => s + (b.reschedulePct || 0), 0) / busmList.length * 10) / 10 : 0,
      sameDayAttendPct: busmList.length > 0 ? Math.round(busmList.reduce((s, b) => s + (b.sameDayAttendPct || 0), 0) / busmList.length * 10) / 10 : 0,
      sameDayAttendCancelPct: busmList.length > 0 ? Math.round(busmList.reduce((s, b) => s + (b.sameDayAttendCancelPct || 0), 0) / busmList.length * 10) / 10 : 0,
      pendingToAttendPct: busmList.length > 0 ? Math.round(busmList.reduce((s, b) => s + (b.pendingToAttendPct || 0), 0) / busmList.length * 10) / 10 : 0,
      tatClosure: {
        c1d: natC1d, tat1dPct: natTat1dPct,
        c2d: natC2d, tat2dPct: natTat2dPct,
        c3d: natC3d, tat3dPct: natTat3dPct,
        c5d: natC5d, tat5dPct: natTat5dPct,
        cStillOpen: natStillOpen, stillOpenPct: natStillOpenPct
      }
    };

    return {
      busms: rankedBusms,
      asms: rankedAsms,
      asps: aspList,
      national: nationalSummary,
    };
  }

  // TAT section's warranty-scope toggle needs two REAL, independently
  // computed datasets — not one dataset with a fabricated volume multiplier
  // applied on top (a prior version scaled the in-warranty numbers by a
  // flat "+18%" to fake an "Overall" view, which is why every closure
  // percentage was identical between the two toggle states regardless of
  // month or BUSM — scaling every bucket by the same constant preserves
  // ratios exactly). "In-Warranty" = Warranty=Yes AND Model type in
  // (Smart, Tablet); "Overall" = every row, no filter.
  const isInWarrantySmartTablet = (r: any) => {
    const raw = r.rawData || {};
    const warranty = String(raw[FIELD_MAP.warranty] || '').trim().toLowerCase();
    const modelType = String(raw[FIELD_MAP.modelType] || raw['Model type'] || '').trim().toLowerCase();
    return warranty === 'yes' && (modelType === 'smart' || modelType === 'tablet');
  };

  const orgKpisByMonth: Record<string, any> = {};
  allHomeMonths.forEach((m) => {
    const monthRows = processedRows.filter((r) => r.month === m);
    orgKpisByMonth[m] = {
      overall: computeOrgKpiTable(monthRows),
      inWarranty: computeOrgKpiTable(monthRows.filter(isInWarrantySmartTablet)),
    };
  });

  const orgKpis = {
    all: {
      overall: computeOrgKpiTable(processedRows),
      inWarranty: computeOrgKpiTable(processedRows.filter(isInWarrantySmartTablet)),
    },
    by_month: orgKpisByMonth,
  };

  // NPS insights — real per-BUSM/ASM breakdowns (All Devices / Smartphone
  // Only / Feature Phone Only), device-category summary, and DSAT reason
  // breakdown, all sourced from the real NpsSurveyRecord dataset. Replaces
  // the frozen-on-June static arrays previously hardcoded in the frontend
  // (spBusmData, spAsmData, busmNpsData, asmNpsData, dsatBusmData,
  // deviceCategoryNps, fpBusmData).
  const npsMonths = [...new Set(npsRows.map((r) => r.month))].filter((m) => m !== 'Unknown');
  const buildNpsBreakdown = (rows: NpsRawRow[], keyFn: (r: NpsRawRow) => string) => {
    const summaries = groupNpsBy(rows, keyFn);
    const entries = Array.from(summaries.entries()).map(([name, s]) => ({ name, ...s }));
    return rankByNps(entries);
  };
  const npsInsightsByMonth: Record<string, any> = {};
  npsMonths.forEach((m) => {
    const monthRows = npsRows.filter((r) => r.month === m);
    const spRows = monthRows.filter((r) => r.deviceCategory === 'SP');
    const fpRows = monthRows.filter((r) => r.deviceCategory === 'FP');

    // ASM/ASP -> parent BUSM/ASM name — a stable mapping (each ASM/ASP
    // belongs to exactly one parent), used so the ASM/ASP breakdown rows
    // below can carry their real parent name for filtering/drill-down.
    const busmByAsm = new Map<string, string>();
    const asmByAsp = new Map<string, string>();
    monthRows.forEach((r) => {
      if (!busmByAsm.has(r.asmName)) busmByAsm.set(r.asmName, r.busmName);
      if (!asmByAsp.has(r.aspName)) asmByAsp.set(r.aspName, r.asmName);
    });
    const withBusm = (rows: any[]) => rows.map((r) => ({ ...r, busm: busmByAsm.get(r.name) || 'Unknown' }));
    const withAsm = (rows: any[]) => rows.map((r) => ({ ...r, asm: asmByAsp.get(r.name) || 'Unknown' }));

    npsInsightsByMonth[m] = {
      busmAll: buildNpsBreakdown(monthRows, (r) => r.busmName),
      busmSmartphone: buildNpsBreakdown(spRows, (r) => r.busmName),
      busmFeaturePhone: buildNpsBreakdown(fpRows, (r) => r.busmName),
      asmAll: withBusm(buildNpsBreakdown(monthRows, (r) => r.asmName)),
      asmSmartphone: withBusm(buildNpsBreakdown(spRows, (r) => r.asmName)),
      aspAll: withAsm(buildNpsBreakdown(monthRows, (r) => r.aspName)),
      aspSmartphone: withAsm(buildNpsBreakdown(spRows, (r) => r.aspName)),
      dsatByBusm: computeDsatBreakdown(monthRows, (r) => r.busmName),
      deviceCategorySummary: [
        { cat: 'Feature Phone', ...summarizeNps(fpRows) },
        { cat: 'Smart Phone', ...summarizeNps(spRows) },
        { cat: 'Overall Combined', ...summarizeNps(monthRows) },
      ].filter((c) => c.sent !== undefined),
    };
  });
  const npsInsights = {
    months: npsMonths,
    by_month: npsInsightsByMonth,
  };

  return {
    summary: {
      total_wo: processedRows.length,
      cross_rows: crossRowsCount,
      importId: latestImport.id,
      filename: latestImport.filename,
    },
    org,
    kpi,
    busm: busmStats,
    asm: asmStats,
    asp: aspStats,
    hier,
    evidence,
    coaching,
    home,
    orgKpis,
    npsInsights,
  };
}
