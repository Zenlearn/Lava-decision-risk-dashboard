import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import logger from './configs/logger.config';
import { invalidateDashboardCache } from './services/cache.service';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting update of Handset Value in WorkOrder rawData...');

  const handsetMapPath = path.join(__dirname, 'handset_values_map.json');
  const handsetMap: Record<string, number> = JSON.parse(fs.readFileSync(handsetMapPath, 'utf-8'));
  const mapSize = Object.keys(handsetMap).length;
  logger.info(`Loaded ${mapSize} handset value mappings from ${handsetMapPath}`);

  const allWorkOrders = await prisma.workOrder.findMany({
    select: {
      id: true,
      rawData: true,
    },
  });

  logger.info(`Found ${allWorkOrders.length} WorkOrder records in database.`);

  let updatedCount = 0;
  let skippedCount = 0;

  const batchSize = 250;
  for (let i = 0; i < allWorkOrders.length; i += batchSize) {
    const chunk = allWorkOrders.slice(i, i + batchSize);
    
    for (const wo of chunk) {
      const raw = wo.rawData as any;
      if (!raw) {
        skippedCount++;
        continue;
      }

      const woNum = String(
        raw['Workorder Number'] ||
        raw['WorkOrder Number'] ||
        raw['Workorder number'] ||
        raw['Job Sheet No'] ||
        ''
      ).trim();

      if (woNum && handsetMap[woNum] !== undefined) {
        const newHandsetValue = handsetMap[woNum];
        
        // Update ONLY 'Handset Value' in rawData and leave everything else untouched
        const updatedRawData = {
          ...raw,
          'Handset Value': newHandsetValue,
          'HandsetValue': newHandsetValue,
        };

        await prisma.workOrder.update({
          where: { id: wo.id },
          data: {
            rawData: updatedRawData,
          },
        });

        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    if ((i + batchSize) % 2500 === 0 || i + batchSize >= allWorkOrders.length) {
      logger.info(`Processed ${Math.min(i + batchSize, allWorkOrders.length)} / ${allWorkOrders.length} work orders...`);
    }
  }

  logger.info(`Update completed! Successfully updated Handset Value for ${updatedCount} work orders (${skippedCount} skipped/unmatched).`);

  // Invalidate Redis dashboard cache so CPC and dashboard tiles reflect new Handset Values
  logger.info('Invalidating dashboard cache...');
  await invalidateDashboardCache();
  logger.info('Dashboard cache invalidated successfully.');
}

main()
  .catch((err) => {
    logger.error('Error during Handset Value update:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
