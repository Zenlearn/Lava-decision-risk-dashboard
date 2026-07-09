import { Router, Request, Response } from 'express';
import logger from '../configs/logger.config';

/**
 * Auth Proxy Routes
 *
 * The Lava frontend authenticates via PathwaysBackend (the source of truth for ZenLearn identity).
 * This router proxies auth requests from the frontend to PathwaysBackend on the internal Docker network,
 * so no public URL for PathwaysBackend is required.
 *
 * PathwaysBackend is reachable at PATHWAYS_BACKEND_URL (default: http://app3001:3001)
 * within the shared app-network Docker network.
 *
 * Flow:
 *   Browser → Vercel Next.js → Lava API /api/v1/auth/* → PathwaysBackend /api/v1/auth/*
 */

const authRouter = Router();

const PATHWAYS_BACKEND_URL =
	process.env.PATHWAYS_BACKEND_URL || 'http://app3001:3001';

/**
 * POST /api/v1/auth/sign-in
 *
 * Proxies login requests to PathwaysBackend.
 * PathwaysBackend endpoint: POST /api/v1/auth/login
 * Accepts: { email: string, password: string }
 * Returns: JWT token (in response body and/or Set-Cookie header)
 */
authRouter.post('/sign-in', async (req: Request, res: Response): Promise<void> => {
	try {
		logger.info('Auth proxy: forwarding sign-in to PathwaysBackend', {
			url: `${PATHWAYS_BACKEND_URL}/api/v1/auth/sign-in`,
		});

		const upstreamResponse = await fetch(`${PATHWAYS_BACKEND_URL}/api/v1/auth/sign-in`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// Forward client IP for PathwaysBackend audit logs
				...(req.ip ? { 'X-Forwarded-For': req.ip } : {}),
			},
			body: JSON.stringify(req.body),
		});

		const data = await upstreamResponse.json() as any;

		// Forward any Set-Cookie headers (PathwaysBackend may set HttpOnly token cookie)
		const setCookieHeader = upstreamResponse.headers.get('set-cookie');
		if (setCookieHeader) {
			res.setHeader('Set-Cookie', setCookieHeader);
		}

		res.status(upstreamResponse.status).json(data);
	} catch (err: any) {
		logger.error('Auth proxy: failed to reach PathwaysBackend', {
			error: err.message,
			url: PATHWAYS_BACKEND_URL,
		});
		res.status(503).json({
			message: 'Authentication service temporarily unavailable. Please try again.',
		});
	}
});

/**
 * POST /api/v1/auth/login
 *
 * Alias for /sign-in — handles clients that call /login directly.
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
	try {
		const upstreamResponse = await fetch(`${PATHWAYS_BACKEND_URL}/api/v1/auth/sign-in`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(req.ip ? { 'X-Forwarded-For': req.ip } : {}),
			},
			body: JSON.stringify(req.body),
		});

		const data = await upstreamResponse.json() as any;

		const setCookieHeader = upstreamResponse.headers.get('set-cookie');
		if (setCookieHeader) {
			res.setHeader('Set-Cookie', setCookieHeader);
		}

		res.status(upstreamResponse.status).json(data);
	} catch (err: any) {
		logger.error('Auth proxy: failed to reach PathwaysBackend', {
			error: err.message,
			url: PATHWAYS_BACKEND_URL,
		});
		res.status(503).json({
			message: 'Authentication service temporarily unavailable. Please try again.',
		});
	}
});

export default authRouter;
