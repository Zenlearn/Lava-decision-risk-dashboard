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
 * TODO (Phase 3): Dealer/ASP roles are intentionally NOT granted here yet.
 * The JWT carries no scope claim identifying which ASP a Dealer/ASP user
 * belongs to (see express.d.ts / jwt.config.ts) — without it there is no way
 * to verify a Dealer/ASP account is requesting *their own* aspName rather than
 * an arbitrary one, which would let any Dealer/ASP account view any other
 * service centre's data via the URL param (IDOR). Add a `lava_scope.aspName`
 * (or serviceCentreId) claim to the shared JWT first, then re-add Dealer/ASP
 * here with a `req.user.lava_scope.aspName === aspName` check.
 */
dashboardRouter.get(
  '/dealer/:aspName',
  requireAnyLavaRole(executiveRoles),
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
