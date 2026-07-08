import { RequestHandler } from 'express';
import logger from '../configs/logger.config';

/**
 * RBAC middleware for Lava role hierarchy.
 *
 * Phase 0 stub — the role hierarchy checks are implemented in Phase 3.
 * For now this middleware provides:
 *   - requireLavaRole(roleName): 403 unless req.user.lava_role matches
 *   - requireAnyLavaRole(roleNames[]): 403 unless req.user.lava_role is in the set
 *
 * Lava roles (from ARCHITECTURE.md §9):
 *   Admin | MD | ServiceHead | RegionalHead | BUSM | ASM | Dealer | ASP | Trainer
 *
 * Pattern from PathwaysBackend/backend/src/middlewares/role.middleware.ts,
 * but decoupled from Mongo department model — Lava roles live in Lava's Postgres.
 */

export type LavaRole =
	| 'Admin'
	| 'MD'
	| 'ServiceHead'
	| 'RegionalHead'
	| 'BUSM'
	| 'ASM'
	| 'Dealer'
	| 'ASP'
	| 'Trainer';

/**
 * Require a specific Lava role.
 * Must be chained AFTER AuthMiddleware.authMiddleware.
 */
export const requireLavaRole = (role: LavaRole): RequestHandler => {
	return (req, res, next) => {
		const userRole = req.user?.lava_role;
		if (userRole === role || req.user?.is_super_admin === true) {
			next();
			return;
		}
		logger.warn('RBAC denied', {
			userId: req.user?.id,
			requiredRole: role,
			actualRole: userRole,
		});
		res.status(403).json({ message: 'Forbidden: insufficient role' });
	};
};

/**
 * Require any of the listed Lava roles.
 * Must be chained AFTER AuthMiddleware.authMiddleware.
 */
export const requireAnyLavaRole = (roles: LavaRole[]): RequestHandler => {
	return (req, res, next) => {
		const userRole = req.user?.lava_role as LavaRole | undefined;
		if (
			(userRole && roles.includes(userRole)) ||
			req.user?.is_super_admin === true
		) {
			next();
			return;
		}
		logger.warn('RBAC denied', {
			userId: req.user?.id,
			requiredRoles: roles,
			actualRole: userRole,
		});
		res.status(403).json({ message: 'Forbidden: insufficient role' });
	};
};
