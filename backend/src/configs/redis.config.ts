import Redis from 'ioredis';
import logger from './logger.config';

/**
 * Redis singleton client.
 *
 * All Redis operations are wrapped in try/catch — Redis is optional at MVP.
 * If Redis is unavailable, cache misses fall through to the DB and the app
 * continues operating (degraded but functional).
 *
 * Copied + adapted from PathwaysBackend/backend/src/configs/redis.config.ts.
 * Removed the BullMQ JobTypes interface — queues are Phase 4, not Phase 0.
 */
export default class RedisClient {
	private static redisInstance: Redis | null = null;

	private constructor() {}

	public static getInstance(): Redis {
		if (!RedisClient.redisInstance) {
			RedisClient.redisInstance = new Redis({
				host: process.env.REDIS_HOST || '127.0.0.1',
				port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
				enableOfflineQueue: false,
				lazyConnect: true,
				maxRetriesPerRequest: 1,
			});
			// Suppress unhandled error crashes — Redis unavailability is handled in safeGet/safeSet
			RedisClient.redisInstance.on('error', () => {});
			logger.info(`[redis] Configured for ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`);
		}
		return RedisClient.redisInstance;
	}

	/** Safe set — silently ignores Redis unavailability */
	public static async safeSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
		try {
			const redis = RedisClient.getInstance();
			if (ttlSeconds) {
				await redis.set(key, value, 'EX', ttlSeconds);
			} else {
				await redis.set(key, value);
			}
		} catch { /* Redis unavailable */ }
	}

	/** Safe get — returns null if Redis unavailable */
	public static async safeGet(key: string): Promise<string | null> {
		try { return await RedisClient.getInstance().get(key); } catch { return null; }
	}

	/** Cache JSON data with TTL (seconds). Returns cached data if available, otherwise calls fetcher. */
	public static async cacheOrFetch<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
		try {
			const cached = await RedisClient.getInstance().get(key);
			if (cached) return JSON.parse(cached) as T;
		} catch { /* Redis unavailable, fall through to fetcher */ }

		const data = await fetcher();

		try {
			await RedisClient.getInstance().set(key, JSON.stringify(data), 'EX', ttlSeconds);
		} catch { /* Redis unavailable, skip caching */ }

		return data;
	}

	/** Invalidate cache keys by pattern (e.g., "dashboard:*") */
	public static async invalidate(pattern: string): Promise<void> {
		try {
			const redis = RedisClient.getInstance();
			const keys = await redis.keys(pattern);
			if (keys.length > 0) await redis.del(...keys);
		} catch { /* Redis unavailable */ }
	}
}
