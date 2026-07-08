import { Router, Request, Response } from 'express';

const dashboardRouter = Router();

/**
 * Dashboard routes — Phase 2 stubs.
 * All return 501 until Phase 2 (real API + Recharts/AG Grid dashboards).
 *
 * Final routes:
 *   GET /api/v1/dashboard/executive
 *   GET /api/v1/dashboard/region/:id
 *   GET /api/v1/dashboard/dealer/:id
 *   GET /api/v1/dashboard/technician/:id
 */

dashboardRouter.get('/executive', (_req: Request, res: Response) => {
	res.status(501).json({ message: 'Executive dashboard not yet implemented (Phase 2)' });
});

dashboardRouter.get('/region/:id', (req: Request, res: Response) => {
	res.status(501).json({ message: `Region dashboard for ${req.params['id']} not yet implemented (Phase 2)` });
});

dashboardRouter.get('/dealer/:id', (req: Request, res: Response) => {
	res.status(501).json({ message: `Dealer dashboard for ${req.params['id']} not yet implemented (Phase 2)` });
});

dashboardRouter.get('/technician/:id', (req: Request, res: Response) => {
	res.status(501).json({ message: `Technician dashboard for ${req.params['id']} not yet implemented (Phase 2)` });
});

export default dashboardRouter;
