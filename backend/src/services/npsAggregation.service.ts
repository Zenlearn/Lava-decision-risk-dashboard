import prisma from '../configs/prisma.config';

/**
 * Real NPS aggregation — the single source of truth for NPS everywhere in
 * the app (Executive NPS tile, Score Card's Audit pillar, Org KPI NPS
 * breakdowns). Replaces both the dormant
 * Master Data "Final NPS Rating" column (dropped from the source file) and
 * the static, frozen-on-June literals that previously lived in the frontend.
 *
 * Classification rule (verified against the real June survey data: national
 * Smart-Phone Detractor/Passive/Promoter/NPS of 10.4/14.5/75.0/+64.6 —
 * matching the org's own reporting to within rounding):
 *   Promoter = rating 5, Passive = rating 3-4, Detractor = rating 1-2.
 *   Percentages are of valid (rated) responses, not of all surveys sent.
 */

export interface NpsRawRow {
  serviceCentreId: string;
  aspName: string;
  asmName: string;
  busmName: string;
  month: string;
  deviceCategory: string | null; // "SP" | "FP" | null (absent that month's source file)
  callType: string | null; // "IVR" | "WhatsApp"
  rating: number | null;
  detractorReason: string | null;
}

export async function fetchNpsRows(months?: string[]): Promise<NpsRawRow[]> {
  const records = await prisma.npsSurveyRecord.findMany({
    where: months ? { month: { in: months } } : undefined,
    select: {
      serviceCentreId: true,
      month: true,
      deviceCategory: true,
      callType: true,
      rating: true,
      detractorReason: true,
      serviceCentre: {
        select: {
          name: true,
          dealer: { select: { name: true, region: { select: { name: true } } } },
        },
      },
    },
  });

  return records.map((r) => ({
    serviceCentreId: r.serviceCentreId,
    aspName: r.serviceCentre.name,
    asmName: r.serviceCentre.dealer.name,
    busmName: r.serviceCentre.dealer.region.name,
    month: r.month ?? 'Unknown',
    deviceCategory: r.deviceCategory,
    callType: r.callType,
    rating: r.rating,
    detractorReason: r.detractorReason,
  }));
}

export interface NpsSummary {
  sent: number;
  responded: number;
  responseRate: number; // % of sent
  detractorPct: number; // % of responded
  passivePct: number;   // % of responded
  promoterPct: number;  // % of responded
  npsScore: number;     // promoterPct - detractorPct
}

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Summarizes a set of survey rows into response-rate/D/P/Promoter/NPS. Returns null for an empty set (never a fabricated zero-row summary). */
export function summarizeNps(rows: NpsRawRow[]): NpsSummary | null {
  const sent = rows.length;
  if (sent === 0) return null;

  const responded = rows.filter((r) => r.rating !== null);
  const n = responded.length;
  if (n === 0) {
    return { sent, responded: 0, responseRate: 0, detractorPct: 0, passivePct: 0, promoterPct: 0, npsScore: 0 };
  }

  const detractor = responded.filter((r) => (r.rating as number) <= 2).length;
  const passive = responded.filter((r) => (r.rating as number) === 3 || (r.rating as number) === 4).length;
  const promoter = responded.filter((r) => (r.rating as number) === 5).length;

  const detractorPct = round1((detractor / n) * 100);
  const passivePct = round1((passive / n) * 100);
  const promoterPct = round1((promoter / n) * 100);

  return {
    sent,
    responded: n,
    responseRate: round1((n / sent) * 100),
    detractorPct,
    passivePct,
    promoterPct,
    npsScore: round1(promoterPct - detractorPct),
  };
}

/** Groups rows by an arbitrary key (BUSM/ASM/ASP name, etc.) and summarizes each group. */
export function groupNpsBy(rows: NpsRawRow[], keyFn: (r: NpsRawRow) => string): Map<string, NpsSummary> {
  const groups = new Map<string, NpsRawRow[]>();
  rows.forEach((r) => {
    const k = keyFn(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  });

  const out = new Map<string, NpsSummary>();
  groups.forEach((groupRows, k) => {
    const s = summarizeNps(groupRows);
    if (s) out.set(k, s);
  });
  return out;
}

export interface DsatBreakdown {
  name: string;
  delay: number;
  repair: number;
  aspBehav: number;
  replace: number;
  cost: number;
  deny: number;
  total: number;
}

// "Satisfied with Service" is deliberately excluded — it means a detractor
// was called back and found satisfied, not a live complaint category.
const DSAT_REASON_KEYS: Record<string, keyof Omit<DsatBreakdown, 'name' | 'total'>> = {
  'Delay in Service': 'delay',
  'Repair Quality': 'repair',
  'ASP Behaviour': 'aspBehav',
  'Replacement / Product Quality Issue': 'replace',
  'High Repair Cost': 'cost',
  'Deny in Service': 'deny',
};

/** DSAT (detractor callback) reason breakdown, grouped by an arbitrary key (typically BUSM name). */
export function computeDsatBreakdown(rows: NpsRawRow[], keyFn: (r: NpsRawRow) => string): DsatBreakdown[] {
  const groups = new Map<string, DsatBreakdown>();

  rows.forEach((r) => {
    if (!r.detractorReason) return;
    const bucket = DSAT_REASON_KEYS[r.detractorReason];
    if (!bucket) return;

    const key = keyFn(r);
    if (!groups.has(key)) {
      groups.set(key, { name: key, delay: 0, repair: 0, aspBehav: 0, replace: 0, cost: 0, deny: 0, total: 0 });
    }
    const g = groups.get(key)!;
    g[bucket] += 1;
    g.total += 1;
  });

  return Array.from(groups.values()).sort((a, b) => b.total - a.total);
}

/** Assigns a 1-based rank to each entry, sorted by NPS score descending (never a fabricated/static rank). */
export function rankByNps<T extends { npsScore: number }>(entries: T[]): (T & { rank: number })[] {
  return [...entries]
    .sort((a, b) => b.npsScore - a.npsScore)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}
