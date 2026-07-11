import { RULES } from '../configs/fieldMap.config';
import { MasterDataRuleRow } from './types';

/**
 * Computes 3 of the 5 fixed Executive Dashboard tiles that are Master-Data-only:
 * First-time fix rate (ftfr), Diagnostic accuracy (diag), Leakage exposure (leak).
 * (mttr comes from processAggregate.rule.ts; csat stays dormant — no NPS/VOC data.)
 *
 * Leakage Exposure is a composite of 4 documented subcategories (see
 * `LeakageBreakdown` below) — each with its own formula so the ₹ total is
 * auditable, not a black box. Suspicious Phone (customer fraud pattern) is
 * folded in here as a subcategory rather than feeding Skill or Audit — per
 * Rohit's decision, since it doesn't cleanly fit either category's defined
 * sources (Skill = CPC/parts data; Audit = SRN/DOA/defective-spares compliance).
 *
 * Ghost/Home-board swap costs still use the placeholder per-unit costs
 * (₹1800/₹1200/₹750) — Master Data has no per-line material code to reconcile
 * against the real ZPRP catalog (that reconciliation is only possible for
 * DEF(S+D) rows — see auditAggregate.rule.ts's defOverchargeValue). The
 * "Part-Cost Assumptions" tab remains the place to review/override these.
 */

function matchesField(val1: string | null, val2: string | null, keyword: string): boolean {
  const s1 = (val1 ?? '').toLowerCase();
  const s2 = (val2 ?? '').toLowerCase();
  return s1.includes(keyword) || s2.includes(keyword);
}

function daysDiff(creation: string | Date | null, delivery: string | Date | null): number | null {
  if (!creation || !delivery) return null;
  const c = creation instanceof Date ? creation : new Date(creation);
  const d = delivery instanceof Date ? delivery : new Date(delivery);
  if (isNaN(c.getTime()) || isNaN(d.getTime())) return null;
  const cTime = new Date(c.getFullYear(), c.getMonth(), c.getDate()).getTime();
  const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.max(0, Math.round((dTime - cTime) / (1000 * 60 * 60 * 24)));
}

const HW_SYMPTOM_KEYWORDS = [
  'display', 'touch', 'light', 'mic', 'speaker', 'charging', 'charge', 'power',
  'switch', 'camera', 'keypad', 'dead', 'restart', 'damaged', 'cracked', 'broken',
];
const SW_ACTION_KEYWORDS = [
  'software', 'sw upgrade', 'flashing', 'upgrade', 'reset', 'os', 'setting', 'reload',
];

export interface LeakageSubcategory {
  value: number;
  count: number;
  formula: string;
}

export interface LeakageBreakdown {
  ghostSameDaySwap: LeakageSubcategory;
  homeVisitBoardRepair: LeakageSubcategory;
  homeVisitBounceTravel: LeakageSubcategory;
  suspiciousPhonePattern: LeakageSubcategory;
}

export interface ExecTilesResult {
  ftfr: number | null;
  diag: number | null;
  leak: number;
  leakageBreakdown: LeakageBreakdown;
  breakdown: {
    bounceCount: number;
    mismatchBouncedCount: number;
    crossAspCount: number;
  };
}

function emptyLeakageBreakdown(suspiciousPhoneThreshold: number): LeakageBreakdown {
  return {
    ghostSameDaySwap: {
      value: 0, count: 0,
      formula: 'count(same-day walk-in workorders with PCBA or TP/LCD consumption > 0) × placeholder part cost',
    },
    homeVisitBoardRepair: {
      value: 0, count: 0,
      formula: 'count(home-visit workorders with PCBA or TP/LCD consumption > 0) × placeholder part cost',
    },
    homeVisitBounceTravel: {
      value: 0, count: 0,
      formula: 'count(home-visit workorders whose IMEI repeats > 1× in the month) × placeholder travel cost',
    },
    suspiciousPhonePattern: {
      value: 0, count: 0,
      formula: `sum(Handset Value) across workorders where the same customer phone number appears more than ${suspiciousPhoneThreshold} times in the month — treats the full claimed handset value as at-risk spend under a suspected fraud pattern`,
    },
  };
}

export function computeExecTiles(rows: MasterDataRuleRow[]): ExecTilesResult {
  const leakageBreakdown = emptyLeakageBreakdown(RULES.suspiciousPhone.threshold);

  if (rows.length === 0) {
    return {
      ftfr: null,
      diag: null,
      leak: 0,
      leakageBreakdown,
      breakdown: { bounceCount: 0, mismatchBouncedCount: 0, crossAspCount: 0 },
    };
  }

  const imeiCounts = new Map<string, number>();
  const phoneCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.imei) imeiCounts.set(r.imei, (imeiCounts.get(r.imei) ?? 0) + 1);
    if (r.phone) phoneCounts.set(r.phone, (phoneCounts.get(r.phone) ?? 0) + 1);
  }

  let bounceCount = 0;
  let mismatchBouncedCount = 0;
  let crossAspCount = 0;

  const fallback = RULES.leakageFallbackCost;

  for (const r of rows) {
    const isBounce = r.imei ? (imeiCounts.get(r.imei) ?? 0) > RULES.repeatImei.threshold : false;
    if (isBounce) bounceCount += 1;
    if (r.isCrossAsp) crossAspCount += 1;

    const isHwSymptom = HW_SYMPTOM_KEYWORDS.some((k) => (r.symptomDesc ?? '').toLowerCase().includes(k));
    const isSwAction = SW_ACTION_KEYWORDS.some((k) => (r.actionDesc ?? '').toLowerCase().includes(k));
    const isMismatch = isHwSymptom && isSwAction;
    const isMismatchBounced = isMismatch && isBounce;
    if (isMismatchBounced) mismatchBouncedCount += 1;

    const isWalkIn = matchesField(r.callType, r.callCategory, 'walk-in') || matchesField(r.callType, r.callCategory, 'walk in');
    const isHome = matchesField(r.callType, r.callCategory, 'home');
    const tat = daysDiff(r.creationDate, r.deliveryDate);
    const isSameDay = tat === 0;

    const isPCBA = (r.pcbaConsumption ?? 0) > 0;
    const isLCD = (r.tpLcdConsumption ?? 0) > 0;
    const isBoard = isPCBA || isLCD;

    const isGhost = isWalkIn && isSameDay && isBoard;
    const isHomeBoard = isHome && isBoard;

    // Cost the leakage. Master Data carries no per-line material code (that only
    // exists on DEF(S+D) rows — see auditAggregate.rule.ts's ZPRP reconciliation),
    // so Ghost/Home-board swaps here can't be priced against the real catalog yet.
    if (isGhost) {
      leakageBreakdown.ghostSameDaySwap.count += 1;
      if (isPCBA) leakageBreakdown.ghostSameDaySwap.value += fallback.pcba;
      if (isLCD) leakageBreakdown.ghostSameDaySwap.value += fallback.lcd;
    }
    if (isHomeBoard) {
      leakageBreakdown.homeVisitBoardRepair.count += 1;
      if (isPCBA) leakageBreakdown.homeVisitBoardRepair.value += fallback.pcba;
      if (isLCD) leakageBreakdown.homeVisitBoardRepair.value += fallback.lcd;
    }
    if (isHome && isBounce) {
      leakageBreakdown.homeVisitBounceTravel.count += 1;
      leakageBreakdown.homeVisitBounceTravel.value += fallback.travel;
    }

    const isSuspiciousPhone = r.phone ? (phoneCounts.get(r.phone) ?? 0) > RULES.suspiciousPhone.threshold : false;
    if (isSuspiciousPhone) {
      leakageBreakdown.suspiciousPhonePattern.count += 1;
      leakageBreakdown.suspiciousPhonePattern.value += r.handsetValue ?? 0;
    }
  }

  const leak = Math.round(
    leakageBreakdown.ghostSameDaySwap.value +
    leakageBreakdown.homeVisitBoardRepair.value +
    leakageBreakdown.homeVisitBounceTravel.value +
    leakageBreakdown.suspiciousPhonePattern.value
  );

  const ftfr = Math.round((1 - bounceCount / rows.length) * 1000) / 10;
  const diag = Math.round((1 - mismatchBouncedCount / rows.length) * 1000) / 10;

  return {
    ftfr,
    diag,
    leak,
    leakageBreakdown,
    breakdown: { bounceCount, mismatchBouncedCount, crossAspCount },
  };
}
