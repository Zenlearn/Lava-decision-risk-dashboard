import { Router, Request, Response } from 'express';

const auditRouter = Router();

/**
 * GET /api/v1/audit
 *
 * Phase 3 stub — real audit log query with RBAC scoping.
 * Returns 501 until Phase 3.
 */
auditRouter.get('/', (_req: Request, res: Response) => {
	res.status(501).json({ message: 'Audit endpoint not yet implemented (Phase 3)' });
});

export default auditRouter;
