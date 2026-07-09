import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';

const DEFAULT_TTL_SECONDS = 24 * 60 * 60; // 24 hours default cache TTL

/**
 * Dashboard Cache Service — Lava Decision Risk
 * 
 * Implements a wrapper around the Prisma `DashboardCache` table.
 * Caches heavy DB aggregation dashboard blobs for fast response times.
 */

/** Get cached payload by key, verifying expiration time. */
export async function getCachedDashboard(cacheKey: string): Promise<any | null> {
  try {
    const cached = await prisma.dashboardCache.findUnique({
      where: { cacheKey },
    });

    if (!cached) return null;

    // Check if expired
    if (new Date() > cached.expiresAt) {
      logger.info('Cache expired', { cacheKey });
      // Delete in background
      prisma.dashboardCache.delete({ where: { cacheKey } }).catch((err) =>
        logger.error('Failed to delete expired cache entry', { cacheKey, error: err.message })
      );
      return null;
    }

    return cached.payload;
  } catch (error) {
    logger.error('Error fetching dashboard cache', { cacheKey, error });
    return null;
  }
}

/** Set dashboard cache payload with a key and TTL. */
export async function setCachedDashboard(
  cacheKey: string,
  payload: any,
  importId: string | null = null,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  try {
    await prisma.dashboardCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        payload: payload as object,
        importId,
        expiresAt,
      },
      update: {
        payload: payload as object,
        importId,
        expiresAt,
      },
    });
  } catch (error) {
    logger.error('Error setting dashboard cache', { cacheKey, error });
  }
}

/** Invalidate/clear all dashboard caches. Called when a new file upload finishes. */
export async function invalidateDashboardCache(): Promise<void> {
  try {
    const result = await prisma.dashboardCache.deleteMany({});
    logger.info('Dashboard cache invalidated successfully', { deletedCount: result.count });
  } catch (error) {
    logger.error('Error invalidating dashboard cache', { error });
  }
}
