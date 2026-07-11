import path from 'path';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { ZPRP_FIELD_MAP } from '../../configs/fieldMap.config';
import { ZprpRowSchema } from '../../schemas/datasetImport.schema';
import { parseFile, mapRow, toNumber, toDate } from '../../utils/fileParser.util';
import { invalidateDashboardCache } from '../cache.service';
import { DatasetImportSummary } from './types';

/**
 * Imports the ZPRP Spare Cost catalog — a pure reference table, no ASP link.
 * Re-upserted (not appended) on each import since it's a point-in-time price
 * list keyed on materialCode. Used by auditAggregate.rule.ts to reconcile
 * DEF(S+D) defective-spare amounts against catalog price (overcharge detection).
 *
 * Doesn't touch AspMetricRollup directly on its own — no rollup recompute is
 * triggered here, since prices alone don't change any ASP-month's data; the
 * NEXT DEF(S+D) import (or a future re-run) is what would use the updated
 * catalog. If price freshness needs to retroactively re-cost already-imported
 * DEF(S+D) records, that's a follow-up job, not part of this import.
 */
export async function importSparePriceCatalog(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const rawRows = await parseFile(buffer, safeFilename);
  const mappedRows = rawRows.map((r) => mapRow(r, ZPRP_FIELD_MAP));

  const validRows: { data: ReturnType<typeof ZprpRowSchema.parse> }[] = [];
  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  mappedRows.forEach((mapped, i) => {
    const result = ZprpRowSchema.safeParse(mapped);
    if (result.success) {
      validRows.push({ data: result.data });
    } else {
      rejectedRows.push({ rowIndex: i, errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) });
    }
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'SPARE_PRICE_CATALOG',
      importedBy: uploadedByUserId,
      rowCount: validRows.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  try {
    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batch = validRows.slice(start, start + BATCH_SIZE);
      for (const { data } of batch) {
        const materialCode = String(data.materialCode);
        await prisma.sparePriceCatalog.upsert({
          where: { materialCode },
          create: {
            materialCode,
            materialDescription: data.materialDescription ?? null,
            basicPrice: toNumber(data.basicPrice),
            distributorPrice: toNumber(data.distributorPrice),
            taxRate: toNumber(data.taxRate),
            validFrom: toDate(data.validFrom),
            validTo: toDate(data.validTo),
          },
          update: {
            materialDescription: data.materialDescription ?? null,
            basicPrice: toNumber(data.basicPrice),
            distributorPrice: toNumber(data.distributorPrice),
            taxRate: toNumber(data.taxRate),
            validFrom: toDate(data.validFrom),
            validTo: toDate(data.validTo),
          },
        });
      }
    }

    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'COMPLETE', completedAt: new Date() } });
    await invalidateDashboardCache();
  } catch (err) {
    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'FAILED' } });
    throw err;
  }

  logger.info('ZPRP Spare Cost import complete', { importId: monthlyImport.id, valid: validRows.length, rejected: rejectedRows.length });

  return {
    importId: monthlyImport.id,
    filename: safeFilename,
    rowCount: mappedRows.length,
    validCount: validRows.length,
    rejectedCount: rejectedRows.length,
    rejectedRows: rejectedRows.slice(0, 50),
    processingMs: Date.now() - startMs,
  };
}
