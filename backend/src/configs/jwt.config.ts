import JWT from 'jsonwebtoken';
import { getEnvVar } from '../helpers/env';

/**
 * JWT token validation.
 *
 * IMPORTANT: This module only validates tokens by default — it does NOT
 * generate them for general identity purposes. Token generation for ZenLearn
 * identity lives in PathwaysBackend (the source of truth). Lava only consumes
 * JWTs signed with the shared JWT_SECRET.
 *
 * Copied + adapted from PathwaysBackend/backend/src/configs/jwt.config.ts:
 *   - Removed `generate()` — Lava never issues its own IDENTITY tokens.
 *   - Removed `User` import from @prisma/client — Lava has no `users` table.
 *   - `validate()` is identical.
 *
 * Payload shape expected from ZenLearn JWTs:
 *   { id, role, is_admin, is_super_admin, is_department_manager, organization_id }
 * Lava additionally reads:
 *   { lava_role } — if present, overrides the default role for Lava-specific RBAC
 *
 * ONE deliberate exception — see generateUploadToken() below.
 */

function getJwtSecret(): string {
	return getEnvVar('JWT_SECRET');
}

/** Claims copied into a short-lived upload token — a subset of what auth.middleware.ts reads off req.user. */
export interface UploadTokenClaims {
	id: string;
	role?: string;
	is_admin?: boolean;
	is_super_admin?: boolean;
	organization_id?: string;
	lava_role?: string;
}

export class JWTConfig {
	/**
	 * Verifies a JWT string and returns its decoded payload.
	 *
	 * @param token - Raw JWT string (without the `Bearer ` prefix).
	 * @returns Decoded `JwtPayload` object.
	 * @throws `JsonWebTokenError` if the signature is invalid.
	 * @throws `TokenExpiredError` if the token has passed its `exp` claim.
	 * @throws `Error('Invalid token format')` if token decodes to a plain string.
	 */
	public static validate(token: string): JWT.JwtPayload {
		const decoded = JWT.verify(token, getJwtSecret());
		if (typeof decoded === 'string') {
			throw new Error('Invalid token format');
		}
		return decoded as JWT.JwtPayload;
	}

	/**
	 * Mints a short-lived (15 min), narrowly-scoped token for the ONE case
	 * where Lava must issue its own JWT: direct-to-backend uploads that bypass
	 * Netlify's proxy. Netlify enforces a hard ~7-8MB request body ceiling at
	 * its edge layer regardless of routing mechanism (proven empirically —
	 * confirmed identical on both the serverless-function path and the
	 * netlify.toml edge-redirect path) — far below the ~15.5MB Master Data
	 * file. The browser can't send the real HttpOnly session cookie
	 * cross-domain to lava-api.zenlearn.ai (different eTLD+1 from
	 * PathwaysFrontend's Netlify domain), so the direct upload needs SOME
	 * token to attach as an Authorization header instead.
	 *
	 * This does NOT create a new identity — it only re-signs a copy of an
	 * already-verified caller's claims (see UploadTokenClaims) with a short
	 * expiry, using the same shared secret. The minting endpoint itself
	 * (auth.routes.ts POST /upload-token) requires the normal cookie-based
	 * AuthMiddleware + requireAnyLavaRole check first — this only ever runs
	 * for a caller who already passed that.
	 */
	public static generateUploadToken(claims: UploadTokenClaims): string {
		return JWT.sign({ ...claims, purpose: 'lava_direct_upload' }, getJwtSecret(), { expiresIn: '15m' });
	}
}
