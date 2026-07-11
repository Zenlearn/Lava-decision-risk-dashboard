import path from 'path';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { ELS_FIELD_MAP } from '../../configs/fieldMap.config';
import { ElsRowSchema } from '../../schemas/datasetImport.schema';
import { parseFile, mapRow, toNumber, normalizeMonth } from '../../utils/fileParser.util';
import { newHierarchyCaches, resolveServiceCentre } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { DatasetImportSummary } from './types';

/**
 * Imports the "ELS DOA REP" sheet from the Compliance workbook — DOA claim
 * audit, one of the 3 Audit Score compliance sources.
 */
export async function importComplianceEls(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const rawRows = await parseFile(buffer, filename, 'ELS DOA REP');
  return persistComplianceEls(rawRows, filename, uploadedByUserId);
}

/**
 * Persists already-parsed "ELS DOA REP" rows. Split from parsing so the combined
 * Compliance importer can parse the workbook once (see qc.importer.ts note).
 */
export async function persistComplianceEls(
  rawRows: Record<string, unknown>[],
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const mappedRows = rawRows.map((r) => mapRow(r, ELS_FIELD_MAP));

  const validRows: { data: ReturnType<typeof ElsRowSchema.parse>; raw: Record<string, unknown> }[] = [];
  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  mappedRows.forEach((mapped, i) => {
    const result = ElsRowSchema.safeParse(mapped);
    if (result.success) {
      validRows.push({ data: result.data, raw: mapped['_raw'] as Record<string, unknown> });
    } else {
      rejectedRows.push({ rowIndex: i, errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) });
    }
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'COMPLIANCE_ELS_DOA',
      importedBy: uploadedByUserId,
      rowCount: validRows.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();
  const touchedPairs = new Map<string, { serviceCentreId: string; month: string }>();

  try {
    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batch = validRows.slice(start, start + BATCH_SIZE);
      for (const { data, raw } of batch) {
        const scId = await resolveServiceCentre(caches, data.busmName ?? null, data.asmName ?? null, data.aspCode ?? null, data.aspName ?? null);
        const month = normalizeMonth(data.month);
        if (month) touchedPairs.set(`${scId}::${month}`, { serviceCentreId: scId, month });

        await prisma.complianceElsDoaRecord.create({
          data: {
            importId: monthlyImport.id,
            serviceCentreId: scId,
            workorderNumber: String(data.workorder),
            complianceStatus: data.complianceStatus ?? 'Unknown',
            nonComplianceReason: data.nonComplianceReason ?? null,
            value: toNumber(data.value),
            handsetCategory: data.handsetCategory ?? null,
            month,
            rawData: raw as object,
          },
        });
      }
    }

    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'COMPLETE', completedAt: new Date() } });
    await recomputeAspMonthRollups(Array.from(touchedPairs.values()));
    await invalidateDashboardCache();
  } catch (err) {
    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'FAILED' } });
    throw err;
  }

  logger.info('ELS DOA REP import complete', { importId: monthlyImport.id, valid: validRows.length, rejected: rejectedRows.length });

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
