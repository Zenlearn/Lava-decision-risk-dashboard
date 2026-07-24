import { RequestHandler } from 'express';
import { JWTConfig } from '../configs/jwt.config';
import logger from '../configs/logger.config';

/**
 * Authentication middleware for Lava backend.
 *
 * Reads the JWT from:
 *   1. `token` cookie (HttpOnly, set by PathwaysBackend on login)
 *   2. `Authorization: Bearer <token>` header (for API/tool access)
 *
 * Verifies the signature using the shared JWT_SECRET. On success, populates
 * `req.user` with the decoded payload (ZenLearn user identity + Lava role claims).
 *
 * IMPORTANT: This middleware does NOT update last_seen or hit any database.
 * User identity is fully external — Lava has no `users` table.
 * All user data comes from the JWT claims.
 *
 * Pattern adapted from PathwaysBackend/backend/src/middlewares/auth.middleware.ts.
 * Key difference: no DB round-trip for last_seen (no users table in Lava).
 */
export class AuthMiddleware {
	/**
	 * Main authentication middleware.
	 * Verify the JWT and set req.user. Returns 401 if token is missing or invalid.
	 */
	public static authMiddleware: RequestHandler = async (req, res, next) => {
		try {
			const cookieToken = req.cookies?.token as string | undefined;
			const authHeader = req.headers.authorization;
			const bearerToken = authHeader?.startsWith('Bearer ')
				? authHeader.split(' ')[1]
				: authHeader;

			const token = cookieToken ?? bearerToken;

			if (!token) {
				res.status(401).json({
					message: 'Authentication token missing',
				});
				return;
			}

			const payload = JWTConfig.validate(token);

			// Extract user id — support multiple JWT shapes from ZenLearn
			const userId = (
				payload['id'] ||
				payload['sub'] ||
				payload['_id'] ||
				payload['user_id']
			) as string | undefined;

			if (!userId && payload['is_super_admin'] !== true) {
				res.status(401).json({
					message: 'User ID missing in token',
				});
				return;
			}

			req.user = {
				id: userId ?? '',
				email: (payload['email'] || payload['user_email'] || payload['username']) as string | undefined,
				name: (payload['name'] || payload['full_name'] || payload['first_name']) as string | undefined,
				role: payload['role'] as string | undefined,
				is_admin: payload['is_admin'] as boolean | undefined,
				is_super_admin: payload['is_super_admin'] as boolean | undefined,
				is_department_manager: payload['is_department_manager'] as boolean | undefined,
				organization_id: payload['organization_id'] as string | undefined,
				lava_role: payload['lava_role'] as string | undefined,
				iat: payload.iat,
				exp: payload.exp,
			};

			next();
		} catch (err: any) {
			logger.warn('Auth failure', { message: err.message as string });
			res.status(401).json({
				message: 'Invalid or expired token',
			});
		}
	};

	/**
	 * Super-admin guard. Must be chained AFTER authMiddleware.
	 * Returns 403 if the authenticated user is not a super admin.
	 */
	public static requireSuperAdmin: RequestHandler = (req, res, next) => {
		if (req.user?.is_super_admin === true) {
			next();
			return;
		}
		res.status(403).json({ message: 'Forbidden: Super admin access required' });
	};
}
