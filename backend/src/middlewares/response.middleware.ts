import { NextFunction, Request, Response } from 'express';

/**
 * Response Middleware — Adds res.success() and res.error() helpers to all routes.
 *
 * Mount BEFORE any route handlers:
 *   app.use(responseMiddleware);
 *
 * Usage in controllers:
 *   res.success({ message: 'OK', result: data });
 *   res.error({ code: 404, message: 'Not found' });
 *
 * Copied + adapted from PathwaysBackend/backend/src/middlewares/response.middleware.ts.
 */
export const responseMiddleware = function (_req: Request, res: Response, next: NextFunction) {
	res.success = function ({ result = undefined, code = 200, message = 'Success' }) {
		res.status(code).json({
			message,
			result: result ?? null,
		});
	};

	res.error = function ({ error = undefined, code = 400, message = 'Bad request' }) {
		res.status(code).json({
			message,
			...(error !== undefined && { error }),
		});
	};

	next();
};
