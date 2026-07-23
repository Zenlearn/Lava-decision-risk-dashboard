import path from 'path';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { DEF_FIELD_MAP } from '../../configs/fieldMap.config';
import { DefRowSchema } from '../../schemas/datasetImport.schema';
import { parseFile, mapRow, toNumber, normalizeMonth } from '../../utils/fileParser.util';
import { newHierarchyCaches, resolveServiceCentreByCode } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { sortMonths, splitReplacedAdded } from '../monthReplace.util';
import { DatasetImportSummary } from './types';

/**
 * Imports the "DEF(S+D)" sheet from the Compliance workbook — defective/damaged
 * spare-parts returns, one of the 3 Audit Score compliance sources. Also the
 * only sheet with per-line Part Code, used to reconcile against SparePriceCatalog.
 *
 * NOTE: this sheet has no ASP Name / ASM / BUSM columns — only Asp Code — so
 * hierarchy resolution is code-only (resolveServiceCentreByCode), matched
 * against ServiceCentres already created by a Master Data import.
 */
export async function importComplianceDef(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const rawRows = await parseFile(buffer, filename, 'DEF(S+D)');
  return persistComplianceDef(rawRows, filename, uploadedByUserId);
}

/**
 * Persists already-parsed "DEF(S+D)" rows. Split from parsing so the combined
 * Compliance importer can parse the workbook once (see qc.importer.ts note).
 */
export async function persistComplianceDef(
  rawRows: Record<string, unknown>[],
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const mappedRows = rawRows.map((r) => mapRow(r, DEF_FIELD_MAP));

  const validRows: { data: ReturnType<typeof DefRowSchema.parse>; raw: Record<string, unknown> }[] = [];
  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  mappedRows.forEach((mapped, i) => {
    const result = DefRowSchema.safeParse(mapped);
    if (result.success) {
      validRows.push({ data: result.data, raw: mapped['_raw'] as Record<string, unknown> });
    } else {
      rejectedRows.push({ rowIndex: i, errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) });
    }
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'COMPLIANCE_DEFECTIVE_SPARE',
      importedBy: uploadedByUserId,
      rowCount: validRows.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();

  const fileMonths = sortMonths(
    validRows.map(({ data }) => normalizeMonth(data.monthLabel ?? data.month)).filter((m): m is string => m !== null)
  );
  let replacedMonths: string[] = [];
  let addedMonths: string[] = fileMonths;

  try {
    if (fileMonths.length > 0) {
      const existing = await prisma.complianceDefectiveSpareRecord.findMany({
        where: { month: { in: fileMonths } }, select: { month: true }, distinct: ['month'],
      });
      ({ replacedMonths, addedMonths } = splitReplacedAdded(fileMonths, existing.map((r) => r.month!).filter(Boolean)));
      await prisma.complianceDefectiveSpareRecord.deleteMany({ where: { month: { in: fileMonths } } });
    }

    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batch = validRows.slice(start, start + BATCH_SIZE);
      for (const { data, raw } of batch) {
        const scId = await resolveServiceCentreByCode(caches, data.aspCode ?? null, null, null, null);
        // Prefer the string monthLabel ("June'26") over the numeric Month column —
        // both normalize to the same canonical form, but the label is unambiguous.
        const month = normalizeMonth(data.monthLabel ?? data.month);

        await prisma.complianceDefectiveSpareRecord.create({
          data: {
            importId: monthlyImport.id,
            serviceCentreId: scId,
            challanNo: data.challanNo != null ? String(data.challanNo) : null,
            workOrderNumber: data.workOrderNumber != null ? String(data.workOrderNumber) : null,
            partCode: data.partCode != null ? String(data.partCode) : null,
            category: data.category ?? null,
            complianceStatus: data.complianceStatus ?? 'Unknown',
            amount: toNumber(data.amount),
            debitQty: toNumber(data.debitQty),
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

  logger.info('DEF(S+D) import complete', { importId: monthlyImport.id, valid: validRows.length, rejected: rejectedRows.length, replacedMonths, addedMonths });

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
