import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async Express handler so that any rejected promise is forwarded
 * to the Express error-handling middleware via `next(err)`.
 *
 * Without this wrapper, unhandled promise rejections in route handlers are
 * silently swallowed (Express does not catch async errors by default in v4).
 *
 * Copied from PathwaysBackend/backend/src/configs/async.config.ts — keep in sync.
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction): void => {
		fn(req, res, next).catch(next);
	};
};
