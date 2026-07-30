import path from 'path';
import ExcelJS from 'exceljs';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { newHierarchyCaches, resolveServiceCentre } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { normalizeMonth } from '../../utils/fileParser.util';
import { sortMonths, splitReplacedAdded } from '../monthReplace.util';
import { DatasetImportSummary } from './types';

/**
 * Imports the "MSM Adherence" and "SD - Adherence" sheets from the MSM
 * Achievement workbook — per Rohit, these two (not "Over all MSM Achievement",
 * used previously) are the relevant tabs: MSM Adherence tracks the deposit
 * target, SD - Adherence tracks the stock target, both per ASP per day.
 *
 * Each sheet is a PIVOT with TWO date blocks that repeat the same date
 * headers (status per day, then a value-per-day block) — reading by header
 * name would silently collide the two blocks. Both are read POSITIONALLY:
 * the first date block runs from the day after the target column up to
 * "Total Working Days"; the second date block starts right after the marker
 * column ("Balance" on MSM Adherence, "Actual" on SD - Adherence) and runs
 * for the same number of days.
 *
 * A day is combined into ONE compliance status per ASP: "Non Compliance" if
 * EITHER MSM or SD was non-compliant that day, "Compliance" only if BOTH
 * were compliant, null if both sheets show a non-working day ("-") for it.
 * This is a scope decision, not a schema fact — MsmDailyRecord has no
 * separate SD field, so SD only contributes via this combined status; its
 * own target/actual values are not separately persisted. Revisit if SD needs
 * to be tracked as its own number later.
 */

interface DailyBlock {
  dates: Date[];
  statusByCol: number[]; // column number per date, first block
  valueByCol: number[]; // column number per date, second block (balance/actual)
}

function findDateBlocks(headerRow: ExcelJS.Row, valueMarkerLabel: string): DailyBlock {
  const cells: { colNumber: number; text: string; rawValue: any }[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    cells.push({ colNumber, text: cell.text ? cell.text.trim() : '', rawValue: cell.value });
  });

  const toDate = (rawValue: any): Date | null => {
    let v = rawValue;
    if (v && typeof v === 'object' && 'result' in v) v = v.result;
    const d = v instanceof Date ? v : new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
  };

  const firstBlock = cells.filter((c) => toDate(c.rawValue) !== null && c.colNumber < (cells.find((x) => x.text === valueMarkerLabel)?.colNumber ?? Infinity));
  const markerCol = cells.find((c) => c.text === valueMarkerLabel)?.colNumber;
  if (!markerCol) throw new Error(`Value block marker column "${valueMarkerLabel}" not found in header row.`);
  const secondBlock = cells.filter((c) => c.colNumber > markerCol && toDate(c.rawValue) !== null);

  if (firstBlock.length === 0) throw new Error('No date columns detected in first (status) block.');
  if (secondBlock.length !== firstBlock.length) {
    throw new Error(`Status block has ${firstBlock.length} date columns but value block has ${secondBlock.length} — expected equal counts.`);
  }

  return {
    dates: firstBlock.map((c) => toDate(c.rawValue)!),
    statusByCol: firstBlock.map((c) => c.colNumber),
    valueByCol: secondBlock.map((c) => c.colNumber),
  };
}

interface SheetRecord {
  aspCode: string | null;
  aspName: string | null;
  asmName: string | null;
  busmName: string | null;
  target: number | null;
  daily: { date: Date; status: string | null; value: number | null }[];
}

function parseSheet(worksheet: ExcelJS.Worksheet, targetLabel: string, valueMarkerLabel: string): SheetRecord[] {
  const headerRow = worksheet.getRow(1);
  const staticCols: Record<string, number> = {};
  let targetCol = -1;
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const text = cell.text ? cell.text.trim() : '';
    if (['Service Center Code', 'ASP Name', 'ASO/ASM Name', 'BUSM'].includes(text)) staticCols[text] = colNumber;
    if (text === targetLabel) targetCol = colNumber;
  });

  const { dates, statusByCol, valueByCol } = findDateBlocks(headerRow, valueMarkerLabel);

  const toNumber = (v: any): number | null => {
    if (v === null || v === undefined) return null;
    if (v && typeof v === 'object' && 'result' in v) v = v.result;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? null : n;
  };

  const records: SheetRecord[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const aspCodeCell = staticCols['Service Center Code'] ? row.getCell(staticCols['Service Center Code']).value : null;
    const aspNameCell = staticCols['ASP Name'] ? row.getCell(staticCols['ASP Name']).value : null;
    const asmNameCell = staticCols['ASO/ASM Name'] ? row.getCell(staticCols['ASO/ASM Name']).value : null;
    const busmNameCell = staticCols['BUSM'] ? row.getCell(staticCols['BUSM']).value : null;
    if (!aspCodeCell && !aspNameCell) return;

    const daily = dates.map((date, i) => {
      const statusRaw = row.getCell(statusByCol[i]!).value;
      const statusText = statusRaw === null || statusRaw === undefined ? null : String(statusRaw).trim();
      const status = statusText && statusText !== '-' ? statusText : null;
      const value = toNumber(row.getCell(valueByCol[i]!).value);
      return { date, status, value };
    });

    records.push({
      aspCode: aspCodeCell != null ? String(aspCodeCell) : null,
      aspName: aspNameCell != null ? String(aspNameCell) : null,
      asmName: asmNameCell != null ? String(asmNameCell) : null,
      busmName: busmNameCell != null ? String(busmNameCell) : null,
      target: targetCol > 0 ? toNumber(row.getCell(targetCol).value) : null,
      daily,
    });
  });

  return records;
}

/** Non Compliance beats Compliance beats null (non-working day) when combining MSM + SD for one day. */
function combineStatus(a: string | null, b: string | null): string | null {
  const isNonCompliant = (s: string | null) => (s || '').toLowerCase().includes('non');
  const isCompliant = (s: string | null) => (s || '').toLowerCase() === 'compliance';
  if (isNonCompliant(a) || isNonCompliant(b)) return 'Non Compliance';
  if (isCompliant(a) || isCompliant(b)) return 'Compliance';
  return null;
}

export async function importMsmAchievement(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const msmSheet = workbook.getWorksheet('MSM Adherence');
  const sdSheet = workbook.getWorksheet('SD - Adherence');
  if (!msmSheet) throw new Error('Worksheet "MSM Adherence" not found in MSM Achievement file.');
  if (!sdSheet) throw new Error('Worksheet "SD - Adherence" not found in MSM Achievement file.');

  const msmRecords = parseSheet(msmSheet, 'MSM Target', 'Balance');
  const sdRecords = parseSheet(sdSheet, 'SD - Target', 'Actual');

  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  // Key by ASP code (falls back to name) so MSM and SD rows for the same ASP line up.
  const keyOf = (r: SheetRecord) => r.aspCode || r.aspName || '';
  const sdByKey = new Map<string, SheetRecord>();
  sdRecords.forEach((r) => sdByKey.set(keyOf(r), r));

  interface CombinedRecord {
    aspCode: string | null; aspName: string | null; asmName: string | null; busmName: string | null;
    msmTarget: number | null;
    daily: { date: Date; status: string | null; balanceValue: number | null }[];
  }
  const combined: CombinedRecord[] = [];

  msmRecords.forEach((msmRec, idx) => {
    const sdRec = sdByKey.get(keyOf(msmRec));
    if (!sdRec) {
      rejectedRows.push({ rowIndex: idx + 2, errors: [`No matching SD - Adherence row for ASP "${msmRec.aspName || msmRec.aspCode}"`] });
    }
    const sdByDate = new Map((sdRec?.daily || []).map((d) => [d.date.toISOString().slice(0, 10), d]));

    combined.push({
      aspCode: msmRec.aspCode, aspName: msmRec.aspName, asmName: msmRec.asmName, busmName: msmRec.busmName,
      msmTarget: msmRec.target,
      daily: msmRec.daily.map((d) => {
        const sdDay = sdByDate.get(d.date.toISOString().slice(0, 10));
        return { date: d.date, status: combineStatus(d.status, sdDay?.status ?? null), balanceValue: d.value };
      }),
    });
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'MSM_ACHIEVEMENT',
      importedBy: uploadedByUserId,
      rowCount: combined.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();
  let recordCount = 0;

  const fileMonths = sortMonths(
    combined.flatMap((rec) => rec.daily.map(({ date }) => normalizeMonth(date))).filter((m): m is string => m !== null)
  );
  let replacedMonths: string[] = [];
  let addedMonths: string[] = fileMonths;

  try {
    if (fileMonths.length > 0) {
      const existing = await prisma.msmDailyRecord.findMany({
        where: { month: { in: fileMonths } }, select: { month: true }, distinct: ['month'],
      });
      ({ replacedMonths, addedMonths } = splitReplacedAdded(fileMonths, existing.map((r) => r.month!).filter(Boolean)));
      await prisma.msmDailyRecord.deleteMany({ where: { month: { in: fileMonths } } });
    }

    for (const rec of combined) {
      const scId = await resolveServiceCentre(caches, rec.busmName, rec.asmName, rec.aspCode, rec.aspName);

      for (const { date, status, balanceValue } of rec.daily) {
        const month = normalizeMonth(date);

        await prisma.msmDailyRecord.upsert({
          where: { serviceCentreId_date: { serviceCentreId: scId, date } },
          create: {
            importId: monthlyImport.id,
            serviceCentreId: scId,
            date,
            complianceStatus: status,
            balanceValue,
            msmTarget: rec.msmTarget,
            month,
          },
          update: {
            importId: monthlyImport.id,
            complianceStatus: status,
            balanceValue,
            msmTarget: rec.msmTarget,
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
    await recomputeAspMonthRollups(fileMonths);
    await invalidateDashboardCache();
  } catch (err) {
    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'FAILED' } });
    throw err;
  }

  logger.info('MSM Achievement import complete', { importId: monthlyImport.id, asps: combined.length, dailyRecords: recordCount, replacedMonths, addedMonths });

  return {
    importId: monthlyImport.id,
    filename: safeFilename,
    rowCount: recordCount,
    validCount: combined.length,
    rejectedCount: rejectedRows.length,
    rejectedRows: rejectedRows.slice(0, 50),
    replacedMonths,
    addedMonths,
    processingMs: Date.now() - startMs,
  };
}
