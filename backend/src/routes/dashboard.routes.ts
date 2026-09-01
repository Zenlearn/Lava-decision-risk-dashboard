import { Router } from 'express';
import {
  getExecutiveDashboardHandler,
  getDealerDashboardHandler,
  getRegionDashboardHandler,
  getTechnicianDashboardHandler,
  getFullDashboardDataHandler,
  getTrainingStatusHandler,
  getTrainingRulesHandler,
  createTrainingRuleHandler,
  deleteTrainingRuleHandler,
  manualAssignHandler,
  getMyProgrammesHandler,
  getProgrammeProgressHandler,
} from '../controllers/dashboard.controller';
import { asyncHandler } from '../configs/async.config';
import { requireAnyLavaRole } from '../middlewares/rbac.middleware';

const dashboardRouter = Router();

// Executive, Management, and full aggregated datasets require strategic management roles
const executiveRoles: any[] = ['Admin', 'MD', 'ServiceHead', 'RegionalHead', 'BUSM', 'ASM'];

/**
 * GET /api/v1/dashboard/executive
 * 
 * Returns full aggregate scoring metrics, monthly line trend charts,
 * action hit-list (top 100 anomalous workorders), and unique hierarchy filter values.
 */
dashboardRouter.get(
  '/executive', 
  requireAnyLavaRole(executiveRoles),
  asyncHandler(getExecutiveDashboardHandler)
);

/**
 * GET /api/v1/dashboard/full-data
 * 
 * Returns the complete aggregated DATA payload (Feb-Apr months, KPIs, BUSMs, ASMs, ASPs,
 * evidence logs, coaching records, thresholds, etc.) matching the mockup structure.
 */
dashboardRouter.get(
  '/full-data', 
  requireAnyLavaRole(executiveRoles),
  asyncHandler(getFullDashboardDataHandler)
);

/**
 * GET /api/v1/dashboard/dealer/:aspName
 *
 * Returns performance snapshots, anomaly incident count breakdowns, and
 * a complete list of flagged workorders for a specific Service Centre (ASP).
 *
 * Dealer/ASP users are allowed; getDealerDashboardHandler enforces an
 * ownership check — a Dealer/ASP may only view the aspName that matches
 * their JWT lava_scope.aspName claim (IDOR protection). Admin-tier users
 * bypass the ownership check and can view any service centre.
 */
dashboardRouter.get(
  '/dealer/:aspName',
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP'] as any[]),
  asyncHandler(getDealerDashboardHandler)
);

/**
 * GET /api/v1/dashboard/region/:id
 *
 * Returns the same aggregate payload as /executive, scoped to one Region.
 * Only admin tiers and the owning BUSM may view it (see canAccessRegion) —
 * ASM is deliberately excluded from the role list: a region view exposes
 * every ASM/ASP beneath it, wider than an ASM's own mapped ASPs.
 */
dashboardRouter.get(
  '/region/:id',
  requireAnyLavaRole(['Admin', 'MD', 'ServiceHead', 'RegionalHead', 'BUSM'] as any[]),
  asyncHandler(getRegionDashboardHandler)
);

/**
 * GET /api/v1/dashboard/technician/:id
 *
 * Returns per-technician work order metrics. Admin tiers, BUSM, ASM, and
 * Dealer/ASP are all allowed in; getTechnicianDashboardHandler enforces
 * ownership via canAccessTechnician (BUSM: own region, ASM: own dealer,
 * ASP/Dealer: own service centre only) — IDOR protection.
 */
dashboardRouter.get(
  '/technician/:id',
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP'] as any[]),
  asyncHandler(getTechnicianDashboardHandler)
);

// Training proxy routes — forwarded to ZenLearn PathwaysBackend over internal network
const adminRoles: any[] = ['Admin', 'MD', 'ServiceHead'];

/**
 * GET /api/v1/dashboard/training-status
 * Scope-filtered training completion data. Open to all Lava roles; scope enforced in handler.
 */
dashboardRouter.get(
  '/training-status',
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP', 'Trainer'] as any[]),
  asyncHandler(getTrainingStatusHandler),
);

/**
 * GET /api/v1/dashboard/training-rules
 * Lists active ZenLearn assignment rules. Admin-tier only.
 */
dashboardRouter.get(
  '/training-rules',
  requireAnyLavaRole(adminRoles),
  asyncHandler(getTrainingRulesHandler),
);

/**
 * POST /api/v1/dashboard/training-rules
 * Creates a new assignment rule in ZenLearn. Admin-tier only.
 */
dashboardRouter.post(
  '/training-rules',
  requireAnyLavaRole(adminRoles),
  asyncHandler(createTrainingRuleHandler),
);

/**
 * DELETE /api/v1/dashboard/training-rules/:id
 * Deletes an assignment rule in ZenLearn. Admin-tier only.
 */
dashboardRouter.delete(
  '/training-rules/:id',
  requireAnyLavaRole(adminRoles),
  asyncHandler(deleteTrainingRuleHandler),
);

/**
 * POST /api/v1/dashboard/training-assign
 * Manually assigns a training programme to a user. Admin-tier only.
 */
dashboardRouter.post(
  '/training-assign',
  requireAnyLavaRole(adminRoles),
  asyncHandler(manualAssignHandler),
);

/**
 * GET /api/v1/dashboard/my-programmes
 * Current user's assigned ZenLearn programmes. Available to all Lava roles.
 */
dashboardRouter.get(
  '/my-programmes',
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP', 'Trainer'] as any[]),
  asyncHandler(getMyProgrammesHandler),
);

/**
 * GET /api/v1/dashboard/my-programmes/:programmeId/progress
 * Per-module progress for the current user in a specific programme. Available to all Lava roles.
 */
dashboardRouter.get(
  '/my-programmes/:programmeId/progress',
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP', 'Trainer'] as any[]),
  asyncHandler(getProgrammeProgressHandler),
);

export default dashboardRouter;
