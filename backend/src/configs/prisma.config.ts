import { PrismaClient } from '@prisma/client';
import logger from './logger.config';

// DATABASE_URL is loaded by dotenv in the entry point (index.ts) before this module runs.
const dbUrl = process.env.DATABASE_URL;

/** Log only the cluster hostname — never the credentials. */
function safeDbHost(url: string | undefined): string {
	if (!url) return '(DATABASE_URL not set)';
	try {
		return new URL(url).hostname;
	} catch {
		return '(unparseable)';
	}
}
logger.info(`[prisma] Connecting to DB host: ${safeDbHost(dbUrl)}`);

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
} else {
	// Disconnect old client if it exists (handles hot-reload credential changes)
	if ((global as any)._lava_prisma) {
		(global as any)._lava_prisma.$disconnect().catch(() => {});
	}
	(global as any)._lava_prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
	prisma = (global as any)._lava_prisma;
}

export default prisma;
