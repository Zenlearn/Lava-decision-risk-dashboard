import prisma from '../configs/prisma.config';

/**
 * Org hierarchy resolution — Region (BUSM) → Dealer (ASM) → ServiceCentre (ASP).
 *
 * Shared across ALL 6 dataset importers (Master Data, Compliance sheets, S@H,
 * MSM, ZPRP-adjacent). Previously private to import.service.ts (Master Data
 * only) — extracted so every importer resolves ASPs the same way.
 *
 * Resolution is CODE-FIRST: ServiceCentre is looked up by `code` (ASP Code /
 * Service Centre Code) when the incoming row has one — verified as a reliable
 * cross-file join key (100% match on Compliance/IMEI-QC codes, 99% on S@H
 * codes, against Master Data). Falls back to name matching only when a file
 * lacks a code column. Region/Dealer have no code column in this data drop
 * (BUSM Code / ASM Code were dropped) — resolved by name only.
 */

export interface HierarchyCaches {
  regionCache: Map<string, string>;
  dealerCache: Map<string, string>;
  scCache: Map<string, string>;
}

export function newHierarchyCaches(): HierarchyCaches {
  return { regionCache: new Map(), dealerCache: new Map(), scCache: new Map() };
}

async function upsertRegion(busmName: string | null): Promise<string> {
  const name = busmName ?? 'Unknown Region';
  const region = await prisma.region.upsert({
    where:  { name },
    create: { name },
    update: {},
    select: { id: true },
  });
  return region.id;
}

async function upsertDealer(asmName: string | null, regionId: string): Promise<string> {
  const name = asmName ?? 'Unknown Dealer';

  const existing = await prisma.dealer.findFirst({ where: { name, regionId }, select: { id: true } });
  if (existing) return existing.id;

  const created = await prisma.dealer.create({ data: { name, regionId }, select: { id: true } });
  return created.id;
}

async function upsertServiceCentre(
  aspCode: string | number | null,
  aspName: string | null,
  dealerId: string
): Promise<string> {
  const code = aspCode != null ? String(aspCode) : null;
  const name = aspName ?? code ?? 'Unknown Service Centre';

  const whereClause = [];
  if (code) whereClause.push({ code, dealerId });
  whereClause.push({ name, dealerId });

  const existing = await prisma.serviceCentre.findFirst({ where: { OR: whereClause }, select: { id: true } });
  if (existing) return existing.id;

  const created = await prisma.serviceCentre.create({ data: { name, code, dealerId }, select: { id: true } });
  return created.id;
}

/**
 * Resolves (or creates) the Region → Dealer → ServiceCentre chain for one row,
 * using the caller-provided caches to avoid redundant DB round-trips within an
 * import batch. Returns the resolved serviceCentreId.
 */
export async function resolveServiceCentre(
  caches: HierarchyCaches,
  busmName: string | null,
  asmName: string | null,
  aspCode: string | number | null,
  aspName: string | null
): Promise<string> {
  const regionKey = busmName ?? 'UNKNOWN';
  if (!caches.regionCache.has(regionKey)) {
    caches.regionCache.set(regionKey, await upsertRegion(busmName));
  }

  const dealerKey = asmName ?? 'UNKNOWN';
  if (!caches.dealerCache.has(dealerKey)) {
    caches.dealerCache.set(dealerKey, await upsertDealer(asmName, caches.regionCache.get(regionKey)!));
  }

  const scKey = aspCode != null ? String(aspCode) : (aspName ?? 'UNKNOWN');
  if (!caches.scCache.has(scKey)) {
    caches.scCache.set(scKey, await upsertServiceCentre(aspCode, aspName, caches.dealerCache.get(dealerKey)!));
  }

  return caches.scCache.get(scKey)!;
}

/**
 * Resolves a ServiceCentre by ASP Code alone — for datasets that only carry a
 * code (e.g. MSM sheets) without BUSM/ASM context on every row. Falls back to
 * creating an "Unknown" hierarchy chain if the code isn't already known from
 * a prior Master Data import.
 */
export async function resolveServiceCentreByCode(
  caches: HierarchyCaches,
  aspCode: string | number | null,
  aspName: string | null,
  busmName: string | null,
  asmName: string | null
): Promise<string> {
  const code = aspCode != null ? String(aspCode) : null;
  if (code) {
    const existing = await prisma.serviceCentre.findFirst({ where: { code }, select: { id: true } });
    if (existing) return existing.id;
  }
  // No existing ServiceCentre with this code — create the full chain (Unknown Region/Dealer if not given).
  return resolveServiceCentre(caches, busmName, asmName, aspCode, aspName);
}
