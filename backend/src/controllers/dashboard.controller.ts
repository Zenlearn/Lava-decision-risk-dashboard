import { Request, Response } from 'express';
import { getExecutiveDashboard, getDealerDashboard } from '../services/dashboard.service';
import { getCachedDashboard, setCachedDashboard } from '../services/cache.service';
import logger from '../configs/logger.config';

/**
 * Executive Dashboard Handler
 * 
 * GET /api/v1/dashboard/executive
 * Query params: busmName (string), asmName (string)
 */
export async function getExecutiveDashboardHandler(req: Request, res: Response): Promise<void> {
  const busmName = (req.query.busmName as string) || 'All';
  const asmName = (req.query.asmName as string) || 'All';

  // Construct cache key based on selected filters
  const cacheKey = `dashboard:executive:busm_${busmName.replace(/\s+/g, '_')}:asm_${asmName.replace(/\s+/g, '_')}`;

  try {
    // 1. Try to read from cache
    const cachedData = await getCachedDashboard(cacheKey);
    if (cachedData) {
      res.success({
        code: 200,
        message: 'Executive dashboard loaded from cache',
        result: cachedData,
      });
      return;
    }

    // 2. Fetch fresh aggregates from database
    const freshData = await getExecutiveDashboard({ busmName, asmName });

    // 3. Save to cache
    await setCachedDashboard(cacheKey, freshData, freshData.importId);

    res.success({
      code: 200,
      message: 'Executive dashboard computed successfully',
      result: freshData,
    });
  } catch (error) {
    logger.error('Error in getExecutiveDashboardHandler', { error, busmName, asmName });
    res.error({
      code: 500,
      message: 'Failed to compute executive dashboard analytics.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Dealer (ASP) Dashboard Handler
 * 
 * GET /api/v1/dashboard/dealer/:aspName
 */
export async function getDealerDashboardHandler(req: Request, res: Response): Promise<void> {
  const aspNameRaw = req.params['aspName'];

  if (!aspNameRaw || typeof aspNameRaw !== 'string') {
    res.error({
      code: 400,
      message: 'Service Centre Name (aspName) parameter is required and must be a string.',
    });
    return;
  }

  const aspName = aspNameRaw;
  const cacheKey = `dashboard:dealer:${aspName.replace(/\s+/g, '_')}`;

  try {
    // 1. Try cache
    const cachedData = await getCachedDashboard(cacheKey);
    if (cachedData) {
      res.success({
        code: 200,
        message: `Dealer snapshot for "${aspName}" loaded from cache`,
        result: cachedData,
      });
      return;
    }

    // 2. Fetch fresh
    const freshData = await getDealerDashboard(aspName);

    // 3. Cache
    await setCachedDashboard(cacheKey, freshData, freshData.importId);

    res.success({
      code: 200,
      message: `Dealer snapshot for "${aspName}" computed successfully`,
      result: freshData,
    });
  } catch (error) {
    logger.error('Error in getDealerDashboardHandler', { error, aspName });
    res.error({
      code: 500,
      message: `Failed to compute dashboard analytics for service centre "${aspName}".`,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
