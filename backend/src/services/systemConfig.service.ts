import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';

const configCache = new Map<string, { value: string; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Reads a system configuration value from the database with caching.
 * Falls back to environment variable if not found in DB.
 *
 * Usage:
 *   const apiKey = await getSystemConfig('CLAUDE_API_KEY', 'CLAUDE_API_KEY');
 *   // Tries DB first, falls back to process.env.CLAUDE_API_KEY
 */
export async function getSystemConfig(
  configKey: string,
  envVarName?: string
): Promise<string | null> {
  // Check cache first
  const cached = configCache.get(configKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: configKey },
    });

    if (config) {
      configCache.set(configKey, { value: config.value, cachedAt: Date.now() });
      return config.value;
    }
  } catch (err) {
    logger.warn('SystemConfig query failed, falling back to env', {
      key: configKey,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Fall back to environment variable if provided
  if (envVarName) {
    return process.env[envVarName] || null;
  }

  return null;
}

/**
 * Sets a system configuration value in the database.
 * Use this to update API keys and other secrets at runtime.
 */
export async function setSystemConfig(
  configKey: string,
  value: string,
  updatedByUserId?: string
): Promise<void> {
  try {
    await prisma.systemConfig.upsert({
      where: { key: configKey },
      create: { key: configKey, value, updatedBy: updatedByUserId },
      update: { value, updatedBy: updatedByUserId, updatedAt: new Date() },
    });

    // Invalidate cache
    configCache.delete(configKey);
    logger.info('SystemConfig updated', { key: configKey, updatedBy: updatedByUserId });
  } catch (err) {
    logger.error('Failed to set SystemConfig', {
      key: configKey,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
