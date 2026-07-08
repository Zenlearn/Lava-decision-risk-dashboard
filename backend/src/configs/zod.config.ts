import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Express middleware factory that validates `req.body` against a Zod schema.
 *
 * Usage:
 *   router.post('/imports', validateSchema(ImportUploadSchema), handler);
 *
 * SECURITY NOTE: All schemas passed here MUST use `.strict()` to reject
 * unrecognized fields. Never use `.passthrough()` — it allows mass-assignment
 * attacks where an attacker injects fields like `is_admin` into the request body.
 *
 * Copied from PathwaysBackend/backend/src/configs/zod.config.ts — keep in sync.
 */
export const validateSchema = (schema: ZodSchema<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			res.status(400).json({
				message: 'Request validation failed',
				errors: result.error.errors,
			});
			return;
		}
		req.body = result.data;
		next();
	};
};
