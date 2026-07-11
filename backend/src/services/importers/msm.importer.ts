import path from 'path';
import ExcelJS from 'exceljs';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { newHierarchyCaches, resolveServiceCentre } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { normalizeMonth } from '../../utils/fileParser.util';
import { DatasetImportSummary } from './types';

/**
 * Imports the "Over all MSM Achievement" sheet from the MSM Achievement
 * workbook — daily ASP stock/deposit compliance (financial exposure), one of
 * the 3 Process Score inputs.
 *
 * This sheet is a PIVOT: one column per calendar day. Unlike every other
 * dataset, it CANNOT go through the generic parseFile()/mapRow() column-name
 * lookup — the "MSM Adherence" sheet (not imported here) repeats the same
 * date strings as headers for two different blocks (compliance status, then
 * balance value), which would silently collide if read by header name. This
 * importer reads columns POSITIONALLY with ExcelJS directly.
 *
 * "Over all MSM Achievement" has only ONE date block (compliance status per
 * day) — unambiguous — so balanceValue/msmTarget are left null here; only
 * complianceStatus (which feeds the Process Score's MSM shortfall streak and
 * % achievement) is populated. Re-visit if per-day balance trend is needed later.
 */
export async function importMsmAchievement(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.getWorksheet('Over all MSM Achievement');
  if (!worksheet) throw new Error('Worksheet "Over all MSM Achievement" not found in MSM Achievement file.');

  // Row 1 header cells: Service Center Code | ASP Name | ASO/ASM Name | BUSM | <dates...> | Total Working Days | ...
  const headerRow = worksheet.getRow(1);
  const staticCols: Record<string, number> = {};
  const dateCols: { colNumber: number; date: Date }[] = [];
  let firstNonStaticCol = -1;

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const text = cell.text ? cell.text.trim() : '';
    if (['Service Center Code', 'ASP Name', 'ASO/ASM Name', 'BUSM'].includes(text)) {
      staticCols[text] = colNumber;
      return;
    }
    if (['Total Working Days', 'MSM Achievement', '% MSM Achievement', 'Remarks', 'MSM Adherence', 'SD Adherence', 'Exlude'].includes(text)) {
      return; // trailing summary columns — not dates, not needed for daily records
    }
    // Anything else in the header row is expected to be a date. Most of these
    // cells are FORMULAS (the sheet auto-increments from the first date via
    // "=E1+1" / shared formulas), not plain Date values — ExcelJS represents
    // those as { formula, result } (or { result, sharedFormula } for shared
    // formula cells), so the formula result must be unwrapped before checking
    // instanceof Date. Only the very first date column is a literal Date.
    let cellValue: any = cell.value;
    if (cellValue && typeof cellValue === 'object' && 'result' in cellValue) {
      cellValue = cellValue.result;
    }
    const asDate = cellValue instanceof Date ? cellValue : new Date(String(cellValue));
    if (!isNaN(asDate.getTime())) {
      dateCols.push({ colNumber, date: asDate });
      if (firstNonStaticCol === -1) firstNonStaticCol = colNumber;
    }
  });

  if (dateCols.length === 0) {
    throw new Error('No date columns detected in "Over all MSM Achievement" sheet header row.');
  }

  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];
  const parsedRecords: {
    aspCode: string | null;
    aspName: string | null;
    asmName: string | null;
    busmName: string | null;
    dailyStatuses: { date: Date; status: string | null }[];
  }[] = [];

  let dataRowIndex = 0;
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    dataRowIndex += 1;

    const aspCodeCell = staticCols['Service Center Code'] ? row.getCell(staticCols['Service Center Code']).value : null;
    const aspNameCell = staticCols['ASP Name'] ? row.getCell(staticCols['ASP Name']).value : null;
    const asmNameCell = staticCols['ASO/ASM Name'] ? row.getCell(staticCols['ASO/ASM Name']).value : null;
    const busmNameCell = staticCols['BUSM'] ? row.getCell(staticCols['BUSM']).value : null;

    if (!aspCodeCell && !aspNameCell) {
      rejectedRows.push({ rowIndex: dataRowIndex, errors: ['Missing both Service Center Code and ASP Name'] });
      return;
    }

    const dailyStatuses = dateCols.map(({ colNumber, date }) => {
      const cellValue = row.getCell(colNumber).value;
      const text = cellValue === null || cellValue === undefined ? null : String(cellValue).trim();
      // Source uses "-" for non-working days — treat as null (neither compliant nor non-compliant)
      const status = text && text !== '-' ? text : null;
      return { date, status };
    });

    parsedRecords.push({
      aspCode: aspCodeCell != null ? String(aspCodeCell) : null,
      aspName: aspNameCell != null ? String(aspNameCell) : null,
      asmName: asmNameCell != null ? String(asmNameCell) : null,
      busmName: busmNameCell != null ? String(busmNameCell) : null,
      dailyStatuses,
    });
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'MSM_ACHIEVEMENT',
      importedBy: uploadedByUserId,
      rowCount: parsedRecords.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();
  const touchedPairs = new Map<string, { serviceCentreId: string; month: string }>();
  let recordCount = 0;

  try {
    for (const rec of parsedRecords) {
      const scId = await resolveServiceCentre(caches, rec.busmName, rec.asmName, rec.aspCode, rec.aspName);

      for (const { date, status } of rec.dailyStatuses) {
        const month = normalizeMonth(date);
        if (month) touchedPairs.set(`${scId}::${month}`, { serviceCentreId: scId, month });

        await prisma.msmDailyRecord.upsert({
          where: { serviceCentreId_date: { serviceCentreId: scId, date } },
          create: {
            importId: monthlyImport.id,
            serviceCentreId: scId,
            date,
            complianceStatus: status,
            month,
          },
          update: {
            importId: monthlyImport.id,
            complianceStatus: status,
            month,
          },
        });
        recordCount += 1;
      }
    }

    await prisma.monthlyImport.update({
      where: { id: monthlyImport.id },
      data: { status: 'COMPLETE', completedAt: new Date(), rowCount: recordCount },
    });
    await recomputeAspMonthRollups(Array.from(touchedPairs.values()));
    await invalidateDashboardCache();
  } catch (err) {
    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'FAILED' } });
    throw err;
  }

  logger.info('MSM Achievement import complete', { importId: monthlyImport.id, asps: parsedRecords.length, dailyRecords: recordCount });

  return {
    importId: monthlyImport.id,
    filename: safeFilename,
    rowCount: recordCount,
    validCount: parsedRecords.length,
    rejectedCount: rejectedRows.length,
    rejectedRows: rejectedRows.slice(0, 50),
    processingMs: Date.now() - startMs,
  };
}
