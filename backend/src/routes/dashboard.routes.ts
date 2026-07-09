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
 * Scoped ASP centres can view their own, and higher roles can view any ASP.
 */
dashboardRouter.get(
  '/dealer/:aspName', 
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP']),
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
 */
dashboardRouter.get('/technician/:id', requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP']), (req: Request, res: Response) => {
  res.status(501).json({ message: `Individual Technician ID dashboard not yet implemented.` });
});

export default dashboardRouter;
