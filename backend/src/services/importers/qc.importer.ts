import path from 'path';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { QC_FIELD_MAP } from '../../configs/fieldMap.config';
import { QcRowSchema } from '../../schemas/datasetImport.schema';
import { parseFile, mapRow, normalizeMonth } from '../../utils/fileParser.util';
import { newHierarchyCaches, resolveServiceCentre } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { sortMonths, splitReplacedAdded } from '../monthReplace.util';
import { DatasetImportSummary } from './types';

/**
 * Imports the "IMEI QC" sheet from the Compliance workbook — SRN (Service
 * Receipt Note) reconciliation, one of the 3 Audit Score compliance sources.
 */
export async function importComplianceQc(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const rawRows = await parseFile(buffer, filename, 'IMEI QC');
  return persistComplianceQc(rawRows, filename, uploadedByUserId);
}

/**
 * Persists already-parsed "IMEI QC" rows. Split out from parsing so the combined
 * Compliance importer can parse the workbook ONCE (parseWorkbookSheets) and hand
 * each sheet's rows to the matching persist function, instead of re-loading the
 * 6MB workbook three times.
 */
export async function persistComplianceQc(
  rawRows: Record<string, unknown>[],
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const mappedRows = rawRows.map((r) => mapRow(r, QC_FIELD_MAP));

  const validRows: { data: ReturnType<typeof QcRowSchema.parse>; raw: Record<string, unknown> }[] = [];
  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  mappedRows.forEach((mapped, i) => {
    const result = QcRowSchema.safeParse(mapped);
    if (result.success) {
      validRows.push({ data: result.data, raw: mapped['_raw'] as Record<string, unknown> });
    } else {
      rejectedRows.push({ rowIndex: i, errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) });
    }
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'COMPLIANCE_QC',
      importedBy: uploadedByUserId,
      rowCount: validRows.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();

  // Months this file covers — the delete-then-replace scope.
  const fileMonths = sortMonths(
    validRows.map(({ data }) => normalizeMonth(data.month)).filter((m): m is string => m !== null)
  );

  let replacedMonths: string[] = [];
  let addedMonths: string[] = fileMonths;

  try {
    if (fileMonths.length > 0) {
      // Which of these months already had data (for the replaced/added split),
      // then wipe them so this upload becomes the complete truth for its months.
      const existing = await prisma.complianceQcRecord.findMany({
        where: { month: { in: fileMonths } }, select: { month: true }, distinct: ['month'],
      });
      ({ replacedMonths, addedMonths } = splitReplacedAdded(fileMonths, existing.map((r) => r.month!).filter(Boolean)));
      await prisma.complianceQcRecord.deleteMany({ where: { month: { in: fileMonths } } });
    }

    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batch = validRows.slice(start, start + BATCH_SIZE);
      for (const { data, raw } of batch) {
        const scId = await resolveServiceCentre(caches, data.busmName ?? null, data.asmName ?? null, data.aspCode ?? null, data.aspName ?? null);
        const month = normalizeMonth(data.month);

        await prisma.complianceQcRecord.create({
          data: {
            importId: monthlyImport.id,
            serviceCentreId: scId,
            workorderNumber: String(data.workorder),
            complianceStatus: data.complianceStatus ?? 'Unknown',
            qcStatus: data.qcStatus ?? null,
            month,
            rawData: raw as object,
          },
        });
      }
    }

    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'COMPLETE', completedAt: new Date() } });
    await recomputeAspMonthRollups(fileMonths);
    await invalidateDashboardCache();
  } catch (err) {
    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'FAILED' } });
    throw err;
  }

  logger.info('IMEI QC import complete', { importId: monthlyImport.id, valid: validRows.length, rejected: rejectedRows.length, replacedMonths, addedMonths });

  return {
    importId: monthlyImport.id,
    filename: safeFilename,
    rowCount: mappedRows.length,
    validCount: validRows.length,
    rejectedCount: rejectedRows.length,
    rejectedRows: rejectedRows.slice(0, 50),
    replacedMonths,
    addedMonths,
    processingMs: Date.now() - startMs,
  };
}
