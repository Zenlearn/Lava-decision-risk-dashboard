/**
 * Express type augmentations for Lava backend.
 *
 * Extends Express's Request with `req.user` (set by auth.middleware.ts)
 * and Response with `res.success()` / `res.error()` convenience methods.
 */

export interface LavaAuthenticatedUser {
	/** ZenLearn user id (JWT `id` or `sub` claim) */
	id: string;
	/** ZenLearn role string from JWT (e.g. 'user', 'admin') */
	role?: string;
	is_admin?: boolean;
	is_super_admin?: boolean;
	is_department_manager?: boolean;
	organization_id?: string;
	/** Lava-specific role override (Phase 3) — if present, used for Lava RBAC instead of `role` */
	lava_role?: string;
	/** JWT standard claims */
	iat?: number;
	exp?: number;
	[key: string]: unknown;
}

export interface ApiResponseSuccess<T = unknown> {
	message: string;
	result: T;
}

export interface ApiResponseError {
	message: string;
	error?: unknown;
}

declare global {
	namespace Express {
		interface Request {
			user?: LavaAuthenticatedUser;
		}
		interface Response {
			success: <T = unknown>(params: { code?: number; message: string; result?: T }) => void;
			error: (params: { code?: number; message: string; error?: unknown }) => void;
		}
	}
}
