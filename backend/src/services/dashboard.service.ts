import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';
import { FIELD_MAP } from '../configs/fieldMap.config';

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
    repeatImei:       boolean;
    suspiciousPhone:  boolean;
    processBreakdown: boolean;
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
    repeatImei:       number;
    suspiciousPhone:  number;
    processBreakdown: number;
  };
  flaggedWorkOrders: HitListPreviewItem[];
}

/** Get the latest successful import record. */
async function getLatestImportId(): Promise<{ id: string; filename: string } | null> {
  const latest = await prisma.monthlyImport.findFirst({
    where:   { status: 'COMPLETE' },
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

  if (filters?.busmName && filters.busmName !== 'All') {
    workOrderFilter.serviceCentre = {
      dealer: {
        region: {
          name: filters.busmName
        }
      }
    };
  }

  if (filters?.asmName && filters.asmName !== 'All') {
    workOrderFilter.serviceCentre = {
      ...(workOrderFilter.serviceCentre ?? {}),
      dealer: {
        ...(workOrderFilter.serviceCentre?.dealer ?? {}),
        name: filters.asmName
      }
    };
  }

  // 1. Fetch aggregate scores
  const aggregations = await prisma.workOrder.aggregate({
    where: workOrderFilter,
    _avg: {
      processScore: true,
      skillScore:   true,
      auditScore:   true,
    },
    _sum: {
      totalAnomalies: true,
    },
    _count: {
      id: true,
    },
  });

  const metrics: DashboardMetrics = {
    avgProcessScore: Math.round((aggregations._avg.processScore ?? 0) * 10) / 10,
    avgSkillScore:   Math.round((aggregations._avg.skillScore ?? 0) * 10) / 10,
    avgAuditScore:   Math.round((aggregations._avg.auditScore ?? 0) * 10) / 10,
    totalWorkOrders: aggregations._count.id,
    totalAnomalies:  aggregations._sum.totalAnomalies ?? 0,
  };

  // 2. Fetch monthly trend data
  const monthlyGroups = await prisma.workOrder.groupBy({
    by: ['month'],
    where: workOrderFilter,
    _avg: {
      processScore: true,
      skillScore:   true,
      auditScore:   true,
    },
  });

  const trends: MonthlyTrend[] = sortTrends(
    monthlyGroups.map((g) => ({
      month:        g.month ?? 'Unknown',
      processScore: Math.round((g._avg.processScore ?? 0) * 10) / 10,
      skillScore:   Math.round((g._avg.skillScore ?? 0) * 10) / 10,
      auditScore:   Math.round((g._avg.auditScore ?? 0) * 10) / 10,
    }))
  );

  // 3. Fetch Action Center Hit List (Total Anomalies >= 2)
  const hitListRaw = await prisma.workOrder.findMany({
    where: {
      ...workOrderFilter,
      totalAnomalies: { gte: 2 },
    },
    orderBy: {
      totalAnomalies: 'desc',
    },
    take: 100, // retrieve top 100 high-risk orders for executive view
    include: {
      serviceCentre: true,
      riskFlags:     true,
    },
  });

  const hitList: HitListPreviewItem[] = hitListRaw.map((wo) => {
    const rawData = wo.rawData as Record<string, unknown>;
    return {
      id:             wo.id,
      workorder:      String(rawData[FIELD_MAP.workorder] ?? wo.id),
      aspName:        wo.serviceCentre.name,
      customerCity:   String(rawData[FIELD_MAP.customerCity] ?? ''),
      imei:           String(rawData[FIELD_MAP.imei] ?? ''),
      symptomDesc:    String(rawData[FIELD_MAP.symptomDesc] ?? ''),
      totalAnomalies: wo.totalAnomalies ?? 0,
      flags: {
        repeatImei:       wo.riskFlags.some((rf) => rf.ruleKey === 'repeatImei'),
        suspiciousPhone:  wo.riskFlags.some((rf) => rf.ruleKey === 'suspiciousPhone'),
        processBreakdown: wo.riskFlags.some((rf) => rf.ruleKey === 'processBreakdown'),
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
  const hitListCount = await prisma.workOrder.count({
    where: {
      ...workOrderFilter,
      totalAnomalies: { gte: 2 },
    },
  });

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
      incidentSummary: { repeatImei: 0, suspiciousPhone: 0, processBreakdown: 0 },
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

  // 1. Fetch aggregates
  const aggregations = await prisma.workOrder.aggregate({
    where: filterClause,
    _avg: {
      processScore: true,
      skillScore:   true,
      auditScore:   true,
    },
    _sum: {
      totalAnomalies: true,
    },
    _count: {
      id: true,
    },
  });

  const metrics: DashboardMetrics = {
    avgProcessScore: Math.round((aggregations._avg.processScore ?? 0) * 10) / 10,
    avgSkillScore:   Math.round((aggregations._avg.skillScore ?? 0) * 10) / 10,
    avgAuditScore:   Math.round((aggregations._avg.auditScore ?? 0) * 10) / 10,
    totalWorkOrders: aggregations._count.id,
    totalAnomalies:  aggregations._sum.totalAnomalies ?? 0,
  };

  // 2. Incident Summary Count (Repeat IMEI, Suspicious Contact, NPS Detractors)
  const repeatImeiCount = await prisma.riskFlag.count({
    where: {
      workOrder: filterClause,
      ruleKey:   'repeatImei',
    },
  });

  const suspiciousPhoneCount = await prisma.riskFlag.count({
    where: {
      workOrder: filterClause,
      ruleKey:   'suspiciousPhone',
    },
  });

  const processBreakdownCount = await prisma.riskFlag.count({
    where: {
      workOrder: filterClause,
      ruleKey:   'processBreakdown',
    },
  });

  // 3. Flagged Workorders (anomalies > 0)
  const flaggedRaw = await prisma.workOrder.findMany({
    where: {
      ...filterClause,
      totalAnomalies: { gt: 0 },
    },
    orderBy: {
      totalAnomalies: 'desc',
    },
    include: {
      serviceCentre: true,
      riskFlags:     true,
    },
  });

  const flaggedWorkOrders: HitListPreviewItem[] = flaggedRaw.map((wo) => {
    const rawData = wo.rawData as Record<string, unknown>;
    return {
      id:             wo.id,
      workorder:      String(rawData[FIELD_MAP.workorder] ?? wo.id),
      aspName:        wo.serviceCentre.name,
      customerCity:   String(rawData[FIELD_MAP.customerCity] ?? ''),
      imei:           String(rawData[FIELD_MAP.imei] ?? ''),
      symptomDesc:    String(rawData[FIELD_MAP.symptomDesc] ?? ''),
      totalAnomalies: wo.totalAnomalies ?? 0,
      flags: {
        repeatImei:       wo.riskFlags.some((rf) => rf.ruleKey === 'repeatImei'),
        suspiciousPhone:  wo.riskFlags.some((rf) => rf.ruleKey === 'suspiciousPhone'),
        processBreakdown: wo.riskFlags.some((rf) => rf.ruleKey === 'processBreakdown'),
      },
    };
  });

  return {
    importId,
    aspName,
    metrics,
    incidentSummary: {
      repeatImei:       repeatImeiCount,
      suspiciousPhone:  suspiciousPhoneCount,
      processBreakdown: processBreakdownCount,
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
 * Dynamically computes the full multi-tab dashboard dataset structure
 * matching original mockup 'Lava_Decision_Risk_Dashboard.html'.
 */
export async function getFullDashboardData(): Promise<any> {
  const latestImport = await prisma.monthlyImport.findFirst({
    where: { status: 'COMPLETE' },
    orderBy: { importedAt: 'desc' },
  });

  if (!latestImport) {
    return {
      summary: { total_wo: 0, cross_rows: 0, importId: '', filename: '' },
      org: [],
      kpi: { months: [], overall: { ftfr: 0, mttr: 0, csat: 0, diag: 0, leak: 0, _leakparts: { pcba: 0, lcd: 0 }, _leaktravel: 0, bounce: 0, detractor: 0 }, targets: { csat: 95, ftfr: 85, mttr: 2, diag: 98 } },
      busm: [],
      asm: [],
      asp: [],
      hier: {},
      evidence: [],
      coaching: { asm: { cards: {}, thresholds: {} }, asp: { cards: {}, thresholds: {} }, busm: { cards: {}, thresholds: {} } }
    };
  }

  // Fetch all completed workorders
  const workOrders = await prisma.workOrder.findMany({
    where: { importId: latestImport.id },
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

  // Frequency mapping caches
  const imeiCounts = new Map<string, number>();
  const phoneCounts = new Map<string, number>();
  const imeiToAsps = new Map<string, Set<string>>();

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
    }

    if (phone && phone !== 'nan') {
      phoneCounts.set(phone, (phoneCounts.get(phone) || 0) + 1);
    }
  });

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
    const symptomRaw = String(raw[FIELD_MAP.symptomDesc] || '');
    const actionRaw = String(raw['Action Taken'] || '');
    const partRaw = String(raw['Part Name'] || raw['Part Description'] || '');
    const city = String(raw[FIELD_MAP.customerCity] || '');

    const creationDate = raw[FIELD_MAP.creationDate];
    const deliveryDate = raw[FIELD_MAP.deliveryDate];
    
    let tat: number | null = null;
    if (creationDate && deliveryDate) {
      const cDate = new Date(creationDate);
      const dDate = new Date(deliveryDate);
      if (!isNaN(cDate.getTime()) && !isNaN(dDate.getTime())) {
        const diff = dDate.getTime() - cDate.getTime();
        tat = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }
    }
    const isSameDay = tat === 0;

    const isWalkIn = String(raw[FIELD_MAP.callType] || raw[FIELD_MAP.callCategory] || '').toLowerCase().includes('walk-in') || 
                     String(raw[FIELD_MAP.callType] || '').toLowerCase().includes('walk in');
    
    const isHome = String(raw[FIELD_MAP.callType] || raw[FIELD_MAP.callCategory] || '').toLowerCase().includes('home');
    
    const partUpper = partRaw.toUpperCase();
    const isPCBA = partUpper.includes('PCBA') || partUpper.includes('MOTHERBOARD');
    const isLCD = partUpper.includes('LCD') || partUpper.includes('DISPLAY');
    const isBoard = isPCBA || isLCD;

    const isGhost = isWalkIn && isSameDay && isBoard;
    const isHomeBoard = isHome && isBoard;
    
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
    const isDetractor = nps.includes('No Response') || (nps !== '' && parseInt(nps, 10) <= 3);
    const isDOA = String(raw[FIELD_MAP.callType] || raw[FIELD_MAP.callCategory] || '').toUpperCase().includes('DOA') || 
                  String(raw[FIELD_MAP.symptomDesc] || '').toUpperCase().includes('DOA');

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
      if (mStr === 'feb' || mStr === 'february') mClean = 'Feb';
      else if (mStr === 'mar' || mStr === 'march') mClean = 'Mar';
      else if (mStr === 'apr' || mStr === 'april') mClean = 'Apr';
      else if (mStr === 'may' || mStr === 'may') mClean = 'May';
    }

    return {
      row: index + 2,
      wo: String(raw[FIELD_MAP.workorder] ?? wo.id),
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
      isBounce,
      isCrossAsp,
      isMismatch,
      isMismatchBounced,
      isDetractor,
      isDOA,
      isPCBA,
      isLCD,
      processScore: wo.processScore ?? 100,
      skillScore: wo.skillScore ?? 100,
      auditScore: wo.auditScore ?? 100,
      rawData: raw,
    };
  });

  const uniqueMonths = [...new Set(processedRows.map((r) => r.month))].filter((m) => m !== 'Unknown');

  // Chronological sort order helper
  const MONTH_ORDER: Record<string, number> = { Feb: 1, Mar: 2, Apr: 3, May: 4 };
  uniqueMonths.sort((a, b) => (MONTH_ORDER[a] ?? 99) - (MONTH_ORDER[b] ?? 99));

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
    const detractor = mRows.filter((r) => r.isDetractor).length;
    const doa = mRows.filter((r) => r.isDOA).length;

    // Satisfaction score
    const surveyRows = mRows.filter((r) => {
      const rating = String(r.rawData[FIELD_MAP.npsRating] || '');
      return rating !== '' && rating !== 'No Response';
    });
    const promoters = surveyRows.filter((r) => parseInt(String(r.rawData[FIELD_MAP.npsRating]), 10) === 5).length;
    const detractors = surveyRows.filter((r) => parseInt(String(r.rawData[FIELD_MAP.npsRating]), 10) <= 3).length;
    const sat = surveyRows.length > 0 ? Math.round(((promoters - detractors) / surveyRows.length) * 1000) / 10 : 0;

    return {
      month: m,
      wo: woCount,
      process: Math.round((totalProcess / woCount) * 10) / 10,
      skill: Math.round((totalSkill / woCount) * 10) / 10,
      audit: Math.round((totalAudit / woCount) * 10) / 10,
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
      sat,
    };
  });

  // 4. DATA.kpi monthly metrics
  const kpiMonths = uniqueMonths.map((m) => {
    const mRows = processedRows.filter((r) => r.month === m);
    const woCount = mRows.length;

    const bounceCount = mRows.filter((r) => r.isBounce).length;
    const detractorCount = mRows.filter((r) => r.isDetractor).length;
    const mismatchBouncedCount = mRows.filter((r) => r.isMismatchBounced).length;

    const ftfr = Math.round((1 - bounceCount / woCount) * 1000) / 10;
    
    const tatRows = mRows.filter((r) => r.tat !== null);
    const mttr = tatRows.length > 0 ? Math.round((tatRows.reduce((sum, r) => sum + r.tat!, 0) / tatRows.length) * 100) / 100 : 0;

    const surveyRows = mRows.filter((r) => {
      const rating = String(r.rawData[FIELD_MAP.npsRating] || '');
      return rating !== '' && rating !== 'No Response';
    });
    const satResponders45 = surveyRows.filter((r) => {
      const score = parseInt(String(r.rawData[FIELD_MAP.npsRating]), 10);
      return score === 4 || score === 5;
    }).length;
    const csat = surveyRows.length > 0 ? Math.round((satResponders45 / surveyRows.length) * 1000) / 10 : 0;

    const diag = Math.round((1 - mismatchBouncedCount / woCount) * 1000) / 10;

    // Board parts in ghost/home swaps
    const pcbaParts = mRows.filter((r) => r.isPCBA && (r.isGhost || r.isHomeBoard)).length;
    const lcdParts = mRows.filter((r) => r.isLCD && (r.isGhost || r.isHomeBoard)).length;

    const leak = pcbaParts * 3000 + lcdParts * 2000 + bounceCount * 150;

    return {
      month: m,
      wo: woCount,
      ftfr,
      mttr,
      csat,
      diag,
      leak,
      _leakparts: { pcba: pcbaParts, lcd: lcdParts },
      _leaktravel: bounceCount,
      bounce: bounceCount,
      detractor: detractorCount,
      d: { ftfr: 0, mttr: 0, csat: 0, diag: 0, leak: 0 } as any, // populated below
    };
  });

  // Calculate monthly KPI delta changes
  kpiMonths.forEach((cur, index) => {
    if (index === 0) {
      cur.d = { ftfr: null, mttr: null, csat: null, diag: null, leak: null };
    } else {
      const prev = kpiMonths[index - 1]!;
      cur.d = {
        ftfr: Math.round((cur.ftfr - prev.ftfr) * 10) / 10,
        mttr: Math.round((cur.mttr - prev.mttr) * 100) / 100,
        csat: Math.round((cur.csat - prev.csat) * 10) / 10,
        diag: Math.round((cur.diag - prev.diag) * 10) / 10,
        leak: cur.leak - prev.leak,
      };
    }
  });

  // Overall KPI averages
  const overallWo = processedRows.length;
  const overallBounce = processedRows.filter((r) => r.isBounce).length;
  const overallDetractor = processedRows.filter((r) => r.isDetractor).length;
  const overallMismatchBounced = processedRows.filter((r) => r.isMismatchBounced).length;

  const overallFtfr = Math.round((1 - overallBounce / overallWo) * 1000) / 10;
  
  const overallTatRows = processedRows.filter((r) => r.tat !== null);
  const overallMttr = overallTatRows.length > 0 ? Math.round((overallTatRows.reduce((sum, r) => sum + r.tat!, 0) / overallTatRows.length) * 100) / 100 : 0;

  const overallSurveyRows = processedRows.filter((r) => {
    const rating = String(r.rawData[FIELD_MAP.npsRating] || '');
    return rating !== '' && rating !== 'No Response';
  });
  const overallSatResponders45 = overallSurveyRows.filter((r) => {
    const score = parseInt(String(r.rawData[FIELD_MAP.npsRating]), 10);
    return score === 4 || score === 5;
  }).length;
  const overallCsat = overallSurveyRows.length > 0 ? Math.round((overallSatResponders45 / overallSurveyRows.length) * 1000) / 10 : 0;

  const overallDiag = Math.round((1 - overallMismatchBounced / overallWo) * 1000) / 10;

  const overallPcbaParts = processedRows.filter((r) => r.isPCBA && (r.isGhost || r.isHomeBoard)).length;
  const overallLcdParts = processedRows.filter((r) => r.isLCD && (r.isGhost || r.isHomeBoard)).length;
  const overallLeak = overallPcbaParts * 3000 + overallLcdParts * 2000 + overallBounce * 150;

  const kpi = {
    months: kpiMonths,
    overall: {
      ftfr: overallFtfr,
      mttr: overallMttr,
      csat: overallCsat,
      diag: overallDiag,
      leak: overallLeak,
      _leakparts: { pcba: overallPcbaParts, lcd: overallLcdParts },
      _leaktravel: overallBounce,
      bounce: overallBounce,
      detractor: overallDetractor,
    },
    targets: { csat: 95, ftfr: 85, mttr: 2.0, diag: 98 },
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
        process: Math.round((totalProcess / woCount) * 10) / 10,
        skill: Math.round((totalSkill / woCount) * 10) / 10,
        audit: Math.round((totalAudit / woCount) * 10) / 10,
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
        audit: peers.length > 0 ? peers.reduce((sum, p) => sum + p.audit, 0) / peers.length : 96.0,
        skill: peers.length > 0 ? peers.reduce((sum, p) => sum + p.skill, 0) / peers.length : 96.0,
        process: peers.length > 0 ? peers.reduce((sum, p) => sum + p.process, 0) / peers.length : 98.0,
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

  // Top ASPs for board-at-home
  const aspHomeCounts = new Map<string, { asp: string; asm: string; n: number }>();
  processedRows.filter((r) => r.isHomeBoard).forEach((r) => {
    const countObj = aspHomeCounts.get(r.asp) || { asp: r.asp, asm: r.asm, n: 0 };
    countObj.n++;
    aspHomeCounts.set(r.asp, countObj);
  });
  const topAsps = Array.from(aspHomeCounts.values()).sort((a, b) => b.n - a.n).slice(0, 10);

  // Top models for board-at-home
  const modelHomeCounts = new Map<string, number>();
  processedRows.filter((r) => r.isHomeBoard).forEach((r) => {
    modelHomeCounts.set(r.model, (modelHomeCounts.get(r.model) || 0) + 1);
  });
  const topModels = Array.from(modelHomeCounts.entries()).map(([model, n]) => ({ model, n })).sort((a, b) => b.n - a.n).slice(0, 5);

  // Top actions for board-at-home
  const actionHomeCounts = new Map<string, number>();
  processedRows.filter((r) => r.isHomeBoard).forEach((r) => {
    actionHomeCounts.set(r.action, (actionHomeCounts.get(r.action) || 0) + 1);
  });
  const topActions = Array.from(actionHomeCounts.entries()).map(([action, n]) => ({ action, n })).sort((a, b) => b.n - a.n).slice(0, 5);

  const home = {
    board_at_home: homeBoardTotal,
    pct_of_home: pctOfHome,
    pcba_at_home: pcbaAtHome,
    lcd_at_home: lcdAtHome,
    home_repeat_cust: homeRepeatCust,
    top_asps: topAsps,
    top_models: topModels,
    top_actions: topActions,
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
  };
}
