import ExcelJS from 'exceljs';
import { parse as parseCsv } from 'csv-parse/sync';

/**
 * Parses a CSV/XLSX buffer into an array of raw row objects.
 *
 * Shared across all 6 dataset importers (Master Data, Compliance sheets,
 * S@H, MSM, ZPRP) — previously duplicated inline in import.service.ts.
 *
 * @param sheetName - Which worksheet to read (XLSX only). Required for the
 *   Compliance workbook (sheets: "IMEI QC", "DEF(S+D)", "ELS DOA REP") and the
 *   MSM Achievement workbook (sheets: "MSM Adherence", "Over all MSM Achievement").
 *   Defaults to the first worksheet when omitted (Master Data, S@H, ZPRP each
 *   have exactly one relevant sheet).
 */
/** Extracts data rows from a single already-loaded ExcelJS worksheet. */
function extractSheetRows(worksheet: ExcelJS.Worksheet): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];

  const headers: string[] = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cell.text ? cell.text.trim() : '';
  });

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    let hasData = false;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        let val: any = cell.value;
        if (val && typeof val === 'object') {
          if (val.formula) {
            // A formula's result can itself be a Date (including an invalid
            // one) — fall through to the same instanceof-Date validity check
            // below rather than assigning it directly.
            val = val.result !== undefined ? val.result : null;
          }
          if (val && typeof val === 'object' && val.richText) {
            val = val.richText.map((t: any) => t.text || '').join('');
          } else if (val instanceof Date) {
            // Keep valid date objects; some source cells (directly, or via a
            // formula result — e.g. a "Remarks" column with a stray date-like
            // formula) produce an Invalid Date, which Prisma's Json
            // serialization rejects outright — null it instead of letting
            // the whole row's persist fail.
            if (isNaN(val.getTime())) val = null;
          } else if (val && typeof val === 'object' && val.text !== undefined) {
            val = val.text;
          } else if (val && typeof val === 'object' && 'error' in val) {
            // Formula-error cells (#N/A, #REF!, etc.) — ExcelJS represents these
            // as { error: string }. Treat as blank rather than stringifying the
            // object (which silently produced the literal string "[object Object]").
            val = null;
          } else if (val && typeof val === 'object') {
            val = String(val);
          }
        }

        record[header] = val !== undefined ? val : null;
        if (val !== null && val !== '') {
          hasData = true;
        }
      }
    });

    if (hasData) {
      records.push(record);
    }
  });

  return records;
}

export async function parseFile(
  buffer: Buffer,
  filename: string,
  sheetName?: string
): Promise<Record<string, unknown>[]> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    const records = parseCsv(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
    }) as Record<string, unknown>[];
    return records;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const worksheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];
  if (!worksheet) {
    throw new Error(sheetName ? `Worksheet "${sheetName}" not found in file.` : 'Excel file has no worksheets');
  }

  return extractSheetRows(worksheet);
}

/**
 * Loads an XLSX workbook ONCE and extracts rows from multiple named sheets.
 * Used by the combined Compliance importer so the same 6MB workbook isn't
 * re-parsed once per sheet (3× the work). Returns a map keyed by sheet name.
 */
export async function parseWorkbookSheets(
  buffer: Buffer,
  sheetNames: string[]
): Promise<Record<string, Record<string, unknown>[]>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const result: Record<string, Record<string, unknown>[]> = {};
  for (const sheetName of sheetNames) {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      throw new Error(`Worksheet "${sheetName}" not found in file.`);
    }
    result[sheetName] = extractSheetRows(worksheet);
  }
  return result;
}

/** Maps a raw row's spreadsheet column names → logical field names via a field map. */
export function mapRow<T extends Record<string, string>>(
  raw: Record<string, unknown>,
  fieldMap: T
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [logicalKey, columnName] of Object.entries(fieldMap)) {
    mapped[logicalKey] = raw[columnName] ?? null;
  }
  mapped['_raw'] = raw;
  return mapped;
}

/** Coerce a value to a number, or null if empty/unparseable. */
export function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? null : n;
}

/** Coerce a value (Date object, Excel serial, or date string) to a Date, or null. */
// A malformed/blank source cell can parse to a technically-valid but absurd
// Date (e.g. year 1) rather than throwing — reject anything outside a
// plausible reporting-data range instead of letting it silently corrupt
// month-based joins (see rollup.service.ts / normalizeMonth).
const PLAUSIBLE_YEAR_MIN = 2000;
const PLAUSIBLE_YEAR_MAX = 2100;

function isPlausibleDate(d: Date): boolean {
  if (isNaN(d.getTime())) return false;
  const year = d.getUTCFullYear();
  return year >= PLAUSIBLE_YEAR_MIN && year <= PLAUSIBLE_YEAR_MAX;
}

export function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isPlausibleDate(v) ? v : null;
  const d = new Date(String(v));
  return isPlausibleDate(d) ? d : null;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Normalizes a month value to a canonical 3-letter form ('Apr', 'May', 'Jun', ...)
 * so rollup joins by (serviceCentreId, month) work across all 6 datasets, which
 * disagree on month format: Master Data uses 'April'/'May'/'June' (MOnth1 column),
 * Compliance sheets use "April'26"/"May'26"/"June'26" (Month column), DEF(S+D)
 * carries a numeric month (5, 6) alongside a "June'26"-style label, and S@H/MSM
 * have no Month column at all — derive from their date columns instead.
 */
export function normalizeMonth(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;

  if (v instanceof Date) {
    return isNaN(v.getTime()) ? null : MONTH_NAMES[v.getMonth()]!;
  }

  if (typeof v === 'number' && v >= 1 && v <= 12) {
    return MONTH_NAMES[v - 1]!;
  }

  const str = String(v).trim();
  if (str === '') return null;

  // Numeric string month, e.g. "5"
  const asNum = Number(str);
  if (!isNaN(asNum) && asNum >= 1 && asNum <= 12 && /^\d+$/.test(str)) {
    return MONTH_NAMES[asNum - 1]!;
  }

  // "April'26", "April", "Apr", "june'26" etc — take the first 3 letters, capitalize
  const firstWord = str.split(/[^a-zA-Z]/)[0] ?? '';
  if (firstWord.length >= 3) {
    const short = firstWord.slice(0, 3);
    const capitalized = short[0]!.toUpperCase() + short.slice(1).toLowerCase();
    if (MONTH_NAMES.includes(capitalized)) return capitalized;
  }

  return null;
}
