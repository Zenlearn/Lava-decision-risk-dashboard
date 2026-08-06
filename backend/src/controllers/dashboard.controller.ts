import { Request, Response } from 'express';
import { getExecutiveDashboard, getDealerDashboard, getFullDashboardData } from '../services/dashboard.service';
import { getCachedDashboard, setCachedDashboard } from '../services/cache.service';
import { createAuditLog } from './audit.controller';
import logger from '../configs/logger.config';
import { deriveScopeFilter, isAdminTier } from '../helpers/scope';
import {
  fetchTrainingStatus,
  fetchTrainingRules,
  createTrainingRule,
  deleteTrainingRule,
  manualAssignTraining,
  fetchMyProgrammes,
  fetchProgrammeProgress,
} from '../services/lavaTraining.service';


/**
 * Executive Dashboard Handler
 * 
 * GET /api/v1/dashboard/executive
 * Query params: busmName (string), asmName (string)
 */
export async function getExecutiveDashboardHandler(req: Request, res: Response): Promise<void> {
  const requested = {
    busmName: (req.query.busmName as string) || 'All',
    asmName: (req.query.asmName as string) || 'All',
  };
  const scoped = deriveScopeFilter(req.user, requested);
  const busmName = scoped.busmName;
  const asmName = scoped.asmName;

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

    // Audit log
    if (req.user) {
      await createAuditLog({
        userId: req.user.id,
        action: 'DASHBOARD_VIEW',
        resourceType: 'ExecutiveDashboard',
        metadata: { busmName, asmName },
        ipAddress: req.ip,
      });
    }

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

  const u = req.user;
  const isScopedAsp = u?.lava_role === 'ASP' || u?.lava_role === 'Dealer';
  if (isScopedAsp && !isAdminTier(u) && (u as any)?.lava_scope?.aspName !== aspName) {
    res.status(403).json({ message: 'Forbidden: you may only view your own service centre.' });
    return;
  }

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

/**
 * Full Dashboard Data Handler (mockup structure)
 * 
 * GET /api/v1/dashboard/full-data
 */
export async function getFullDashboardDataHandler(req: Request, res: Response): Promise<void> {
  const requested = {
    busmName: (req.query.busmName as string) || 'All',
    asmName: (req.query.asmName as string) || 'All',
  };
  const scoped = deriveScopeFilter(req.user, requested);
  const busmName = scoped.busmName;
  const asmName = scoped.asmName;

  const cacheKey = `dashboard:full_data:busm_${busmName.replace(/\s+/g, '_')}:asm_${asmName.replace(/\s+/g, '_')}`;

  try {
    // 1. Try cache
    const cachedData = await getCachedDashboard(cacheKey);
    if (cachedData) {
      res.success({
        code: 200,
        message: 'Full dashboard payload loaded from cache',
        result: cachedData,
      });
      return;
    }

    // 2. Fetch fresh aggregates
    const freshData = await getFullDashboardData({ busmName, asmName });

    // 3. Cache
    await setCachedDashboard(cacheKey, freshData, freshData.summary ? freshData.summary.importId : null);

    // Audit log
    if (req.user) {
      await createAuditLog({
        userId: req.user.id,
        action: 'DASHBOARD_VIEW',
        resourceType: 'FullDashboard',
        ipAddress: req.ip,
      });
    }

    res.success({
      code: 200,
      message: 'Full dashboard payload computed successfully',
      result: freshData,
    });
  } catch (error) {
    logger.error('Error in getFullDashboardDataHandler', { error });
    res.error({
      code: 500,
      message: 'Failed to compute full dashboard aggregates.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Training Status Handler
 *
 * GET /api/v1/dashboard/training-status
 * Query params: busmName, asmName (scope-filtered per caller's role)
 */
export async function getTrainingStatusHandler(req: Request, res: Response): Promise<void> {
  const requested = {
    busmName: (req.query.busmName as string) || 'All',
    asmName: (req.query.asmName as string) || 'All',
  };
  const scoped = deriveScopeFilter(req.user, requested);
  const rows = await fetchTrainingStatus({ busmName: scoped.busmName, asmName: scoped.asmName });
  res.success({ code: 200, message: 'Training status', result: { rows } });
}

/**
 * Training Rules Handler
 *
 * GET /api/v1/dashboard/training-rules
 */
export async function getTrainingRulesHandler(_req: Request, res: Response): Promise<void> {
  const rules = await fetchTrainingRules();
  res.success({ code: 200, message: 'Assignment rules', result: { rules } });
}

/**
 * Create Training Rule Handler
 *
 * POST /api/v1/dashboard/training-rules
 */
export async function createTrainingRuleHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token ?? (req.headers.authorization?.replace('Bearer ', '') ?? '');
  const rule = await createTrainingRule(req.body, token);
  if (!rule) { res.status(502).json({ message: 'Failed to create rule upstream' }); return; }
  res.success({ code: 201, message: 'Rule created', result: { rule } });
}

/**
 * Delete Training Rule Handler
 *
 * DELETE /api/v1/dashboard/training-rules/:id
 */
export async function deleteTrainingRuleHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token ?? (req.headers.authorization?.replace('Bearer ', '') ?? '');
  const ok = await deleteTrainingRule(req.params['id'] as string, token);
  if (!ok) { res.status(502).json({ message: 'Failed to delete rule upstream' }); return; }
  res.status(204).send();
}

/**
 * Manual Assign Training Handler
 *
 * POST /api/v1/dashboard/training-assign
 */
export async function manualAssignHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token ?? (req.headers.authorization?.replace('Bearer ', '') ?? '');
  const ok = await manualAssignTraining(req.body, token);
  if (!ok) { res.status(502).json({ message: 'Failed to create assignment upstream' }); return; }
  res.success({ code: 201, message: 'Assignment created' });
}

/**
 * My Programmes Handler
 *
 * GET /api/v1/dashboard/my-programmes
 * Returns the current user's assigned ZenLearn programmes.
 */
export async function getMyProgrammesHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: 'Unauthenticated' }); return; }
  const token: string =
    req.cookies?.token ??
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '');
  const assignments = await fetchMyProgrammes(userId, token);
  res.success({ code: 200, message: '', result: { assignments } });
}

/**
 * Programme Progress Handler
 *
 * GET /api/v1/dashboard/my-programmes/:programmeId/progress
 * Returns per-module progress for the current user in a specific programme.
 */
export async function getProgrammeProgressHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { programmeId } = req.params;
  if (!userId) { res.status(401).json({ message: 'Unauthenticated' }); return; }
  const token: string =
    req.cookies?.token ??
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '');
  const modules = await fetchProgrammeProgress(userId, programmeId as string, token);
  res.success({ code: 200, message: '', result: { modules } });
}
