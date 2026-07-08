import { Router, Request, Response } from 'express';
import prisma from '../configs/prisma.config';
import RedisClient from '../configs/redis.config';
import { asyncHandler } from '../configs/async.config';

const healthRouter = Router();

/**
 * GET /api/v1/health
 *
 * Phase 0 verification endpoint. Returns the operational status of:
 *   - API server (always 200 if reachable)
 *   - Database (Postgres via Prisma)
 *   - Cache (Redis — optional, degrades gracefully)
 *
 * This is a PUBLIC route — no auth required.
 * Used by docker healthchecks and Phase 0 verification.
 */
healthRouter.get('/', asyncHandler(async (_req: Request, res: Response) => {
	let dbStatus: 'ok' | 'error' = 'error';
	let dbLatencyMs: number | undefined;

	let redisStatus: 'ok' | 'unavailable' = 'unavailable';

	// Check Postgres
	try {
		const start = Date.now();
		await prisma.$queryRaw`SELECT 1`;
		dbLatencyMs = Date.now() - start;
		dbStatus = 'ok';
	} catch (err: any) {
		// DB error logged server-side; status returned to client
	}

	// Check Redis (optional)
	try {
		const testKey = '_lava_health_check';
		await RedisClient.getInstance().set(testKey, '1', 'EX', 10);
		await RedisClient.getInstance().del(testKey);
		redisStatus = 'ok';
	} catch {
		// Redis unavailable is non-fatal at MVP
	}

	const allOk = dbStatus === 'ok';

	res.status(allOk ? 200 : 503).json({
		status: allOk ? 'ok' : 'degraded',
		timestamp: new Date().toISOString(),
		services: {
			api: 'ok',
			database: dbStatus,
			...(dbLatencyMs !== undefined && { databaseLatencyMs: dbLatencyMs }),
			redis: redisStatus,
		},
		version: '0.1.0',
		phase: 0,
	});
}));

export default healthRouter;
