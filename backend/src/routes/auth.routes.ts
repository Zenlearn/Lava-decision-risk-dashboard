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
 *   Browser → Vercel Next.js → Lava API /api/v1/auth/* → PathwaysBackend /auth/sign-in
 */

const authRouter = Router();

const PATHWAYS_BACKEND_URL =
	process.env.PATHWAYS_BACKEND_URL || 'http://app3001:3001';

/**
 * PathwaysBackend sets the JWT as an HttpOnly cookie via Set-Cookie header only —
 * it does NOT include the token in the JSON response body.
 * Since the Lava frontend is on a different domain (Vercel), the HttpOnly cookie
 * cannot be read or forwarded cross-domain.
 *
 * This helper extracts the raw JWT string from the Set-Cookie header so we can
 * inject it into the JSON response body for the frontend to store as its own cookie.
 */
function extractTokenFromSetCookie(setCookieHeader: string | null): string | null {
	if (!setCookieHeader) return null;
	// Set-Cookie: token=<jwt>; Path=/; HttpOnly; Secure; SameSite=Lax
	const match = setCookieHeader.match(/(?:^|,)\s*token=([^;,\s]+)/i);
	return match?.[1] ?? null;
}

/**
 * POST /api/v1/auth/sign-in
 *
 * Proxies login requests to PathwaysBackend.
 * PathwaysBackend endpoint: POST /auth/sign-in
 * Accepts: { email: string, password: string }
 * Returns: JWT token injected into response body as data.token + data.result.token
 */
authRouter.post('/sign-in', async (req: Request, res: Response): Promise<void> => {
	try {
		logger.info('Auth proxy: forwarding sign-in to PathwaysBackend', {
			url: `${PATHWAYS_BACKEND_URL}/auth/sign-in`,
		});

		const upstreamResponse = await fetch(`${PATHWAYS_BACKEND_URL}/auth/sign-in`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(req.ip ? { 'X-Forwarded-For': req.ip } : {}),
			},
			body: JSON.stringify(req.body),
		});

		const data = await upstreamResponse.json() as any;

		// PathwaysBackend sets JWT only as HttpOnly Set-Cookie — not in JSON body.
		// Extract token and inject into response so the Vercel frontend can set
		// its own cookie on the correct domain.
		const setCookieHeader = upstreamResponse.headers.get('set-cookie');
		const jwtToken = extractTokenFromSetCookie(setCookieHeader);

		if (jwtToken && upstreamResponse.ok) {
			data.token = jwtToken;
			if (data.result && typeof data.result === 'object') {
				data.result.token = jwtToken;
			}
			logger.info('Auth proxy: token extracted from Set-Cookie and injected into response');
		} else if (upstreamResponse.ok && !jwtToken) {
			logger.warn('Auth proxy: login succeeded but no token found in Set-Cookie header', {
				setCookieHeader: setCookieHeader ?? 'none',
			});
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
		const upstreamResponse = await fetch(`${PATHWAYS_BACKEND_URL}/auth/sign-in`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(req.ip ? { 'X-Forwarded-For': req.ip } : {}),
			},
			body: JSON.stringify(req.body),
		});

		const data = await upstreamResponse.json() as any;

		const setCookieHeader = upstreamResponse.headers.get('set-cookie');
		const jwtToken = extractTokenFromSetCookie(setCookieHeader);

		if (jwtToken && upstreamResponse.ok) {
			data.token = jwtToken;
			if (data.result && typeof data.result === 'object') {
				data.result.token = jwtToken;
			}
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
