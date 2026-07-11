import { RULES } from '../configs/fieldMap.config';
import { MasterDataRuleRow, SahAppointmentInput, MsmDailyRecordInput } from './types';

/**
 * Process Score aggregate — TAT (turnaround time), Service-at-Home appointment
 * metrics, and MSM Achievement (financial exposure). Per Rohit's framing: an
 * ASP under its required deposit/stock threshold is money at risk for the
 * company, which is a process-discipline signal, not a quality one — hence
 * MSM lives under Process, not Audit.
 *
 * Customer Satisfaction (NPS/VOC-based) stays dormant — no source data in this
 * drop — and is intentionally NOT substituted by any of these three inputs.
 */

function daysBetween(start: string | Date | null, end: string | Date | null): number | null {
  if (!start || !end) return null;
  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
}

export interface ProcessAggregateResult {
  processScore: number;
  avgTat: number | null;
  tatOverThresholdRate: number | null;
  sahAppointmentCount: number;
  sahCancellationRate: number | null;
  msmPctAchievement: number | null;
  msmConsecutiveShortfallDays: number;
}

export function computeProcessAggregate(
  masterRows: MasterDataRuleRow[],
  sahAppointments: SahAppointmentInput[],
  msmRecords: MsmDailyRecordInput[]
): ProcessAggregateResult {
  // TAT
  const tatValues = masterRows
    .map((r) => daysBetween(r.creationDate, r.deliveryDate))
    .filter((tat): tat is number => tat !== null);
  const avgTat = tatValues.length > 0 ? tatValues.reduce((a, b) => a + b, 0) / tatValues.length : null;
  const overThresholdCount = tatValues.filter((tat) => tat > RULES.tat.maxDays).length;
  const tatOverThresholdRate = tatValues.length > 0 ? overThresholdCount / tatValues.length : null;

  // Service at Home
  const cancelledStatuses = RULES.sahCancellation.cancelledStatuses as readonly string[];
  const sahCancelledCount = sahAppointments.filter(
    (a) => a.appointmentStatus !== null && cancelledStatuses.includes(a.appointmentStatus)
  ).length;
  const sahCancellationRate = sahAppointments.length > 0 ? sahCancelledCount / sahAppointments.length : null;

  // MSM Achievement — daily records already carry Compliance/Non Compliance per day.
  // Consecutive-shortfall streak: longest run of "Non Compliance" days, ordered by date.
  const compliantDays = msmRecords.filter((r) => r.complianceStatus !== null);
  const compliantCount = compliantDays.filter((r) => r.complianceStatus === 'Compliance').length;
  const msmPctAchievement = compliantDays.length > 0 ? compliantCount / compliantDays.length : null;

  const sortedByDate = [...msmRecords].sort((a, b) => a.date.getTime() - b.date.getTime());
  let currentStreak = 0;
  let longestStreak = 0;
  for (const r of sortedByDate) {
    if (r.complianceStatus === 'Non Compliance') {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (r.complianceStatus === 'Compliance') {
      currentStreak = 0;
    }
    // null (non-working day, source uses "-") does not reset or extend the streak
  }

  const processPenalty =
    (tatOverThresholdRate ?? 0) * RULES.tat.penalty +
    (sahCancellationRate ?? 0) * RULES.sahCancellation.penalty +
    (msmPctAchievement !== null && msmPctAchievement < RULES.msmAchievement.minPctThreshold
      ? RULES.msmAchievement.penalty
      : 0);

  const processScore = Math.max(0, RULES.scoreBaseline - processPenalty);

  return {
    processScore,
    avgTat,
    tatOverThresholdRate,
    sahAppointmentCount: sahAppointments.length,
    sahCancellationRate,
    msmPctAchievement,
    msmConsecutiveShortfallDays: longestStreak,
  };
}
