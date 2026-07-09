import { Router, Request, Response } from 'express';
import {
  getExecutiveDashboardHandler,
  getDealerDashboardHandler,
} from '../controllers/dashboard.controller';
import { asyncHandler } from '../configs/async.config';

const dashboardRouter = Router();

/**
 * GET /api/v1/dashboard/executive
 * 
 * Returns full aggregate scoring metrics, monthly line trend charts,
 * action hit-list (top 100 anomalous workorders), and unique hierarchy filter values.
 */
dashboardRouter.get('/executive', asyncHandler(getExecutiveDashboardHandler));

/**
 * GET /api/v1/dashboard/dealer/:aspName
 * 
 * Returns performance snapshots, anomaly incident count breakdowns, and
 * a complete list of flagged workorders for a specific Service Centre (ASP).
 */
dashboardRouter.get('/dealer/:aspName', asyncHandler(getDealerDashboardHandler));

/**
 * GET /api/v1/dashboard/region/:id
 * (Optional Phase 2 stub — executive view filters cover region-level BUSM scoping)
 */
dashboardRouter.get('/region/:id', (req: Request, res: Response) => {
  res.status(501).json({ message: `Scoped Region ID dashboard not yet implemented. Use /executive with busmName filter.` });
});

/**
 * GET /api/v1/dashboard/technician/:id
 * (Phase 2 stub)
 */
dashboardRouter.get('/technician/:id', (req: Request, res: Response) => {
  res.status(501).json({ message: `Individual Technician ID dashboard not yet implemented.` });
});

export default dashboardRouter;
