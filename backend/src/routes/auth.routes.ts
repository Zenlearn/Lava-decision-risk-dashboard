import { Router, Request, Response } from 'express';
import logger from '../configs/logger.config';
import { getEnvVar } from '../helpers/env';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { requireAnyLavaRole } from '../middlewares/rbac.middleware';
import { JWTConfig } from '../configs/jwt.config';
import { importAllowedRoles } from './import.routes';

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

const PATHWAYS_BACKEND_URL = getEnvVar('PATHWAYS_BACKEND_URL', 'http://app3001:3001');

const TOKEN_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * PathwaysBackend sets the JWT as an HttpOnly cookie via Set-Cookie header only —
 * it does NOT include the token in the JSON response body.
 * Since the Lava frontend is on a different domain (Vercel), the HttpOnly cookie
 * cannot be read or forwarded cross-domain.
 *
 * This helper extracts the raw JWT string from the upstream Set-Cookie header(s) so
 * the Lava backend can re-issue its own HttpOnly cookie on its own (same-origin,
 * via the Next.js rewrite) response — the token itself never has to touch client JS.
 *
 * Uses `getSetCookie()` (Node 18.16+/undici), which returns each Set-Cookie header
 * as a separate array entry. Falls back to `.get('set-cookie')` on older runtimes,
 * where multiple Set-Cookie headers get comma-joined by the Fetch spec — a real risk
 * if PathwaysBackend ever sets more than one cookie, but the best available fallback.
 */
function extractTokenFromSetCookie(headers: Headers): string | null {
	const cookieStrings: string[] =
		typeof (headers as any).getSetCookie === 'function'
			? (headers as any).getSetCookie()
			: [headers.get('set-cookie') ?? ''];

	for (const cookieString of cookieStrings) {
		const match = cookieString.match(/(?:^|;\s*)token=([^;]+)/i);
		if (match?.[1]) return match[1];
	}
	return null;
}

/**
 * Re-issues the extracted JWT as our own HttpOnly cookie on the Lava backend's
 * response. Because the browser only ever talks to the frontend's own origin
 * (Next.js proxies /api/v1/* to this backend server-side), a Set-Cookie header
 * from this response is treated by the browser as first-party — no client JS
 * ever needs to read or set the token, so it can stay HttpOnly end to end.
 */
function issueTokenCookie(res: Response, token: string): void {
	res.cookie('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: TOKEN_COOKIE_MAX_AGE_MS,
		path: '/',
	});
}

/**
 * POST /api/v1/auth/sign-in
 *
 * Proxies login requests to PathwaysBackend.
 * PathwaysBackend endpoint: POST /auth/sign-in
 * Accepts: { email: string, password: string }
 * On success, re-issues the JWT as our own first-party HttpOnly cookie — the
 * raw token is never included in the JSON response body (see issueTokenCookie).
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
		// Extract it and re-issue as our own first-party HttpOnly cookie; never
		// forward the raw token into the JSON body (client JS doesn't need it).
		const jwtToken = extractTokenFromSetCookie(upstreamResponse.headers);

		if (jwtToken && upstreamResponse.ok) {
			issueTokenCookie(res, jwtToken);
			logger.info('Auth proxy: token extracted from Set-Cookie and re-issued as first-party cookie');
		} else if (upstreamResponse.ok && !jwtToken) {
			logger.warn('Auth proxy: login succeeded but no token found in Set-Cookie header');
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

		const jwtToken = extractTokenFromSetCookie(upstreamResponse.headers);

		if (jwtToken && upstreamResponse.ok) {
			issueTokenCookie(res, jwtToken);
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
 * POST /api/v1/auth/sign-out
 *
 * Clears the first-party `token` cookie issued by /sign-in. Because that
 * cookie is HttpOnly (see issueTokenCookie), client JS cannot clear it by
 * writing `document.cookie` directly — this endpoint is the only way to log
 * out. `clearCookie` must be called with the same path used when the cookie
 * was set, or the browser won't match and remove it.
 */
authRouter.post('/sign-out', (_req: Request, res: Response): void => {
	res.clearCookie('token', { path: '/' });
	res.status(200).json({ message: 'Signed out' });
});

/**
 * POST /api/v1/auth/upload-token
 *
 * Mints a short-lived (15 min) upload-scoped token for direct-to-backend file
 * uploads that bypass Netlify's proxy — see JWTConfig.generateUploadToken for
 * why this exists. This route sits in the public authRouter group (see
 * index.ts — authRouter isn't behind the global protectedRouter), so unlike
 * import.routes.ts it must apply AuthMiddleware itself before the role check.
 *
 * Called via the normal /lava-api/* Netlify proxy (this request is tiny —
 * no file body — so it isn't affected by the size ceiling this token exists
 * to work around). The returned token is then attached as an Authorization
 * header on ONE subsequent direct POST to the real lava-api.zenlearn.ai
 * /api/v1/imports, which the browser sends directly, skipping Netlify.
 */
authRouter.post(
	'/upload-token',
	AuthMiddleware.authMiddleware,
	requireAnyLavaRole(importAllowedRoles),
	(req: Request, res: Response): void => {
		const token = JWTConfig.generateUploadToken({
			id: req.user!.id,
			role: req.user!.role,
			is_admin: req.user!.is_admin,
			is_super_admin: req.user!.is_super_admin,
			organization_id: req.user!.organization_id,
			lava_role: req.user!.lava_role,
		});
		res.success({ message: 'Upload token issued', result: { token, expiresInSeconds: 15 * 60 } });
	}
);

export default authRouter;
