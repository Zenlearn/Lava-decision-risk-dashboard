import { Router, Request, Response } from 'express';

const importRouter = Router();

/**
 * POST /api/v1/imports
 *
 * Phase 1 stub — full implementation in Phase 1 (import pipeline + rule engine).
 * Returns 501 Not Implemented until Phase 1 is complete.
 *
 * Phase 1 will:
 *   - Accept CSV/XLSX multipart upload
 *   - Validate rows with Zod (schema-driven, not hardcoded columns)
 *   - Run the rule engine
 *   - Persist WorkOrders, RiskFlags, JudgementScores
 *   - Refresh DashboardCache
 */
importRouter.post('/', (_req: Request, res: Response) => {
	res.status(501).json({
		message: 'Import pipeline not yet implemented (Phase 1)',
	});
});

export default importRouter;
