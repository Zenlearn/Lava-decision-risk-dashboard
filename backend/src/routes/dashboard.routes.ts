import { Router, Request, Response } from 'express';
import {
  getExecutiveDashboardHandler,
  getDealerDashboardHandler,
  getFullDashboardDataHandler,
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
 * (Optional Phase 2 stub — executive view filters cover region-level BUSM scoping)
 */
dashboardRouter.get('/region/:id', requireAnyLavaRole(executiveRoles), (req: Request, res: Response) => {
  res.status(501).json({ message: `Scoped Region ID dashboard not yet implemented. Use /executive with busmName filter.` });
});

/**
 * GET /api/v1/dashboard/technician/:id
 * (Phase 2 stub)
 *
 * TODO (Phase 3): same scope-claim gap as /dealer/:aspName above — Dealer/ASP
 * excluded until the JWT carries a verifiable ownership claim.
 */
dashboardRouter.get('/technician/:id', requireAnyLavaRole(executiveRoles), (req: Request, res: Response) => {
  res.status(501).json({ message: `Individual Technician ID dashboard not yet implemented.` });
});

export default dashboardRouter;
