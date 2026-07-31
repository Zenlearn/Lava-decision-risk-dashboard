import prisma from './configs/prisma.config';
import logger from './configs/logger.config';
import { recomputeAspMonthRollups } from './services/rollup.service';
import { invalidateDashboardCache } from './services/cache.service';
import { FIELD_MAP } from './configs/fieldMap.config';

async function main() {
  logger.info('Clean Feature Phones migration starting...');

  // 1. Fetch all work orders in the database
  const workOrders = await prisma.workOrder.findMany({
    select: { id: true, rawData: true, month: true }
  });

  logger.info(`Loaded ${workOrders.length} total work orders. Inspecting model types...`);

  // 2. Identify Feature Phones
  const toDelete: string[] = [];
  const affectedMonths = new Set<string>();

  workOrders.forEach((wo) => {
    const raw = wo.rawData as any;
    const modelType = String(
      raw[FIELD_MAP.modelType] || raw['Model type'] || raw['Model Type'] || ''
    ).trim().toLowerCase();

    const isSmartOrTablet = modelType.includes('smart') || modelType.includes('tablet');
    if (!isSmartOrTablet) {
      toDelete.push(wo.id);
      if (wo.month) {
        affectedMonths.add(wo.month);
      }
    }
  });

  logger.info(`Found ${toDelete.length} feature phone work orders to delete.`);

  if (toDelete.length > 0) {
    // 3. Batch delete the feature phone work orders (Cascade will clean up RiskFlags)
    const batchSize = 1000;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      await prisma.workOrder.deleteMany({
        where: { id: { in: batch } }
      });
      logger.info(`Deleted batch ${i / batchSize + 1} (${batch.length} rows)...`);
    }
    logger.info('WorkOrder deletion complete.');

    // 4. Recompute affected month rollups
    const months = Array.from(affectedMonths);
    logger.info('Recomputing rollups for affected months:', months);
    await recomputeAspMonthRollups(months);
    logger.info('Rollup recomputation complete.');
  } else {
    logger.info('No feature phone work orders found. Database is already clean.');
    // Recompute anyway for standard months to be absolutely safe
    logger.info('Recomputing rollups for Apr, May, Jun to verify consistency...');
    await recomputeAspMonthRollups(['Apr', 'May', 'Jun']);
  }

  // 5. Invalidate caches
  logger.info('Invalidating dashboard cache...');
  await invalidateDashboardCache();
  logger.info('Cache invalidation complete.');

  logger.info('Feature phone clean-up and rollup recalculation successfully completed!');
}

main()
  .catch((err) => {
    logger.error('Error during feature phone clean-up migration:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
