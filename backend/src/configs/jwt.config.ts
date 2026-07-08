import JWT from 'jsonwebtoken';
import { getEnvVar } from '../helpers/env';

/**
 * JWT token validation.
 *
 * IMPORTANT: This module only validates tokens — it does NOT generate them.
 * Token generation lives in PathwaysBackend (the source of truth for identity).
 * Lava only consumes JWTs signed with the shared JWT_SECRET.
 *
 * Copied + adapted from PathwaysBackend/backend/src/configs/jwt.config.ts:
 *   - Removed `generate()` — Lava never issues its own tokens.
 *   - Removed `User` import from @prisma/client — Lava has no `users` table.
 *   - `validate()` is identical.
 *
 * Payload shape expected from ZenLearn JWTs:
 *   { id, role, is_admin, is_super_admin, is_department_manager, organization_id }
 * Lava additionally reads:
 *   { lava_role } — if present, overrides the default role for Lava-specific RBAC
 */

function getJwtSecret(): string {
	return getEnvVar('JWT_SECRET');
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
}
