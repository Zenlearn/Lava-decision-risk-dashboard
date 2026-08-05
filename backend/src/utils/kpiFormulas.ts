import { FIELD_MAP } from '../configs/fieldMap.config';

export interface ScorecardMetrics {
  wo: number;
  tatPct: number;
  cpc: number;
  sahPct: number;
  diagPct: number;
  cagPct: number;

  // CPC breakdown
  repairTotal: number;
  repairAvg: number;
  replTotal: number;
  replAvg: number;
  combinedCost: number;

  // TAT breakdown
  tat1dCount: number;
  tat2dPct: number;
  tat3dPct: number;
  tat5dPct: number;
  stillOpenPct: number;

  // S@H breakdown
  cancelPct: number;
  reschedulePct: number;
  sameDayAttendPct: number;
  sameDayAttendCancelPct: number;
  pendingPct: number;
}

/**
 * Computes all scorecard metrics from a given array of work orders.
 * This guarantees that the formula for CPC, TAT, SAH, and CAG is identical
 * whether rolling up at the BUSM, ASM, ASP, or National level.
 */
export function computeScorecardMetrics(rows: any[]): ScorecardMetrics {
  const wo = rows.length;
  
  // Base counts
  const bounceCount = rows.filter((r) => r.isBounce).length;
  const mismatchBouncedCount = rows.filter((r) => r.isMismatchBounced).length;

  // TAT
  const tatRows = rows.filter((r) => r.tat !== null);
  const tat1dCount = tatRows.filter((r) => r.tat! <= 1).length;
  const tatPct = tatRows.length > 0 
    ? Math.round((tat1dCount / tatRows.length) * 1000) / 10 
    : (wo > 0 ? Math.round((1 - bounceCount / wo) * 1000) / 10 : 0);

  // CPC
  const totalPartVal = rows.reduce((sum, r) => sum + (r.cpcPartVal || 0), 0);
  const repairRows = rows.filter((r) => (r.cpcPartVal || 0) > 0);
  const replRows = rows.filter((r) => r.isReplacement || String(r.rawData?.[FIELD_MAP.callType] || '').trim().toUpperCase() === 'Z9');
  
  const replTotal = Math.round(replRows.reduce((sum, r) => sum + (r.handsetVal || 12000), 0));
  const combinedCost = totalPartVal + replTotal;
  const partsAndReplWos = repairRows.length + replRows.length;
  const cpc = partsAndReplWos > 0 ? Math.round(combinedCost / partsAndReplWos) : 0;

  // SAH
  const homeRows = rows.filter((r) => r.isHome);
  const homeAdherence = homeRows.filter((r) => r.tat !== null && r.tat <= 3).length;
  const sahPct = homeRows.length > 0 ? Math.round((homeAdherence / homeRows.length) * 1000) / 10 : 0;

  // Diagnostics
  const diagPct = wo > 0 ? Math.round((1 - mismatchBouncedCount / wo) * 1000) / 10 : 0;

  // CAG
  const avgProcess = wo > 0 ? rows.reduce((sum, r) => sum + r.processScore, 0) / wo : 0;
  const avgSkill = wo > 0 ? rows.reduce((sum, r) => sum + r.skillScore, 0) / wo : 0;
  const avgAudit = wo > 0 ? rows.reduce((sum, r) => sum + r.auditScore, 0) / wo : 0;
  const cagPct = Math.round(((avgProcess + avgSkill + avgAudit) / 3) * 10) / 10;

  // --- Breakdowns ---

  // CPC Breakdown
  const repairTotal = Math.round(repairRows.reduce((s, r) => s + (r.cpcPartVal || 0), 0));
  const repairAvg = repairRows.length > 0 ? Math.round(repairTotal / repairRows.length) : 0;
  const replAvg = replRows.length > 0 ? Math.round(replTotal / replRows.length) : 0;

  // TAT Breakdown
  const c2d = tatRows.filter((r) => r.tat === 2).length;
  const c3d = tatRows.filter((r) => r.tat === 3).length;
  const c5d = tatRows.filter((r) => r.tat !== null && r.tat >= 5).length;
  const cStillOpen = rows.filter((r) => r.tat === null && !r.isBounce && !r.isDetractor).length;

  const tat2dPct = wo > 0 ? Math.round((c2d / wo) * 1000) / 10 : 0;
  const tat3dPct = wo > 0 ? Math.round((c3d / wo) * 1000) / 10 : 0;
  const tat5dPct = wo > 0 ? Math.round((c5d / wo) * 1000) / 10 : 0;
  const stillOpenPct = wo > 0 ? Math.round((cStillOpen / wo) * 1000) / 10 : 0;

  // SAH Breakdown
  const cancelCount = rows.filter((r) => r.isBounce || r.isDetractor || (r.flag && r.flag.includes('cancel'))).length;
  const cancelPct = wo > 0 ? Math.round((cancelCount / wo) * 1000) / 10 : 0;

  const rescheduleCount = rows.filter((r) => r.tat !== null && r.tat > 3).length;
  const reschedulePct = wo > 0 ? Math.round((rescheduleCount / wo) * 1000) / 10 : 0;

  const sameDayAttendCount = rows.filter((r) => r.tat !== null && r.tat <= 1).length;
  const sameDayAttendPct = wo > 0 ? Math.round((sameDayAttendCount / wo) * 1000) / 10 : 0;

  const sameDayAttendCancelCount = rows.filter((r) => r.tat !== null && r.tat <= 1 && (r.isBounce || r.isMismatch)).length;
  const sameDayAttendCancelPct = wo > 0 ? Math.round((sameDayAttendCancelCount / wo) * 1000) / 10 : 0;

  const pendingCount = rows.filter((r) => r.tat === null && !r.isBounce && !r.isDetractor).length;
  const pendingPct = wo > 0 ? Math.round((pendingCount / wo) * 1000) / 10 : 0;

  return {
    wo,
    tatPct,
    cpc,
    sahPct,
    diagPct,
    cagPct,

    repairTotal,
    repairAvg,
    replTotal,
    replAvg,
    combinedCost,

    tat1dCount,
    tat2dPct,
    tat3dPct,
    tat5dPct,
    stillOpenPct,

    cancelPct,
    reschedulePct,
    sameDayAttendPct,
    sameDayAttendCancelPct,
    pendingPct
  };
}
