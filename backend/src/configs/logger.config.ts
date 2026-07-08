/**
 * Structured Logger (Winston)
 *
 * Production: JSON format with timestamps — designed for log aggregation (CloudWatch, Datadog, etc.)
 * Development: Colorized, human-readable format with HH:mm:ss timestamps
 *
 * Usage:
 *   import logger from '../configs/logger.config';
 *   logger.info('Import started', { importId: 'clxxx', rowCount: 500 });
 *   logger.error('Rule engine failed', { importId, error: err.message });
 *
 * Zero `console.*` calls anywhere in this codebase — always use this logger.
 *
 * Copied from PathwaysBackend/backend/src/configs/logger.config.ts — keep in sync.
 */
import { createLogger, format, transports } from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
	level: isProduction ? 'info' : 'debug',
	format: isProduction
		? format.combine(
				format.timestamp(),
				format.errors({ stack: true }),
				format.json()
			)
		: format.combine(
				format.colorize(),
				format.timestamp({ format: 'HH:mm:ss' }),
				format.errors({ stack: true }),
				format.printf(({ timestamp, level, message, stack, ...meta }) => {
					const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
					return `${timestamp} ${level}: ${stack || message}${metaStr}`;
				})
			),
	transports: [new transports.Console()],
});

export default logger;
