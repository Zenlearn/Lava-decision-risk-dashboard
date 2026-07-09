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
