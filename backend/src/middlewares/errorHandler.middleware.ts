import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';

/**
 * Global Express error handler.
 *
 * Must be registered LAST — after all routes and middleware:
 *   app.use(errorHandler);
 *
 * Catches any error passed to `next(err)` (including asyncHandler rejections).
 * In development, the full stack trace is returned to the client.
 * In production, only a generic message is returned.
 */
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
	logger.error('Unhandled error', { message: err.message, stack: err.stack });

	const statusCode = (err.status as number | undefined) || 500;
	const isDev = process.env.NODE_ENV !== 'production';

	res.status(statusCode).json({
		message: isDev ? (err.message as string) : 'Internal Server Error',
		...(isDev && { stack: err.stack as string }),
	});
};
