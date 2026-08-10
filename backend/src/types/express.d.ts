/**
 * Express type augmentations for Lava backend.
 *
 * Extends Express's Request with `req.user` (set by auth.middleware.ts)
 * and Response with `res.success()` / `res.error()` convenience methods.
 *
 * NOTE: This file must have `export {}` at the top to be treated as a module
 * (required for `declare global` to work). Named exports have been intentionally
 * removed to avoid ts-node-dev "Debug Failure" errors with .d.ts files.
 * The interfaces are file-private — they don't need to be imported anywhere
 * since they augment the global Express namespace directly.
 */

export {};

interface LavaAuthenticatedUser {
	/** ZenLearn user id (JWT `id` or `sub` claim) */
	id: string;
	email?: string;
	name?: string;
	/** ZenLearn role string from JWT (e.g. 'user', 'admin') */
	role?: string;
	is_admin?: boolean;
	is_super_admin?: boolean;
	is_department_manager?: boolean;
	organization_id?: string;
	/**
	 * Org role — generic RBAC role for any org using ZenLearn.
	 * For Lava: 'Admin' | 'MD' | 'ServiceHead' | 'RegionalHead' | 'BUSM' | 'ASM' | 'ASP' | 'Dealer' | 'Trainer'
	 * Populated from JWT `org_role` claim (or legacy `lava_role` for existing sessions).
	 */
	org_role?: string;
	/** Org scope — identifies the organisational slice a user may access */
	org_scope?: {
		busmName?: string;
		asmName?: string;
		serviceCentreId?: string;
		aspName?: string;
		[key: string]: string | undefined;
	};
	/** @deprecated Use org_role. Kept for backward compat during token transition. */
	lava_role?: string;
	/** @deprecated Use org_scope. Kept for backward compat during token transition. */
	lava_scope?: {
		busmName?: string;
		asmName?: string;
		serviceCentreId?: string;
		aspName?: string;
	};
	/** JWT standard claims */
	iat?: number;
	exp?: number;
	[key: string]: unknown;
}

interface ApiResponseSuccess<T = unknown> {
	message: string;
	result: T;
}

interface ApiResponseError {
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
