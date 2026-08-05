import path from 'path';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { NPS_FIELD_MAP } from '../../configs/fieldMap.config';
import { NpsRowSchema } from '../../schemas/datasetImport.schema';
import { parseFile, mapRow, toDate, normalizeMonth, listSheetNames } from '../../utils/fileParser.util';
import { newHierarchyCaches, resolveServiceCentre } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { sortMonths, splitReplacedAdded } from '../monthReplace.util';
import { DatasetImportSummary } from './types';

/**
 * Imports the NPS survey workbook — per-call IVR/WhatsApp customer
 * satisfaction survey data, the real source for Customer Satisfaction/NPS
 * everywhere in the app (distinct from Master Data's dropped "Final NPS
 * Rating" column, which stays dormant).
 *
 * The raw per-response sheet is named after the month ("Jun'26 RAW",
 * "May'26 RAW", "Apr'26 RAW", ...) so it's located by pattern rather than a
 * hardcoded name. CRITICAL: each month's workbook also carries a leftover
 * RAW sheet from an earlier month (e.g. the June file contains BOTH
 * "Mar'26 RAW" and "Jun'26 RAW") — matching the pattern alone is ambiguous
 * and silently picks the wrong month's data. The month token in the
 * filename disambiguates which matching sheet is actually current.
 *
 * Two other columns also change spelling/name release to release
 * ("Detractor Calling" vs "Dectractor Calling" [sic]; "SMT/FP" vs "SP / FP",
 * absent entirely in the April file) — normalizeNpsHeaders() folds these
 * into the canonical names NPS_FIELD_MAP expects before mapping.
 */

const RAW_SHEET_PATTERN = /'?\s*26\s*RAW$/i;
const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Picks the RAW sheet matching the month named in the filename, from among
 * every sheet matching RAW_SHEET_PATTERN. Throws rather than guessing when
 * the filename doesn't unambiguously name a month that also has a matching
 * sheet — importing the wrong month's survey data silently would be worse
 * than failing loudly and asking for a clearer filename/sheet name.
 */
function selectRawSheetName(sheetNames: string[], filename: string): string {
  const candidates = sheetNames.filter((n) => RAW_SHEET_PATTERN.test(n.trim()));
  if (candidates.length === 0) {
    throw new Error(`Could not find any raw survey sheet (expected a name like "Jun'26 RAW") among: ${sheetNames.join(', ')}`);
  }
  if (candidates.length === 1) {
    return candidates[0]!;
  }

  const filenameMonth = MONTH_ABBREVIATIONS.find((m) => new RegExp(m, 'i').test(filename));
  if (!filenameMonth) {
    throw new Error(
      `Multiple candidate raw sheets found (${candidates.join(', ')}) and the filename "${filename}" doesn't unambiguously name a month to disambiguate them.`
    );
  }

  const matched = candidates.find((n) => new RegExp(filenameMonth, 'i').test(n));
  if (!matched) {
    throw new Error(
      `Filename "${filename}" indicates month "${filenameMonth}", but no candidate sheet name matches it: ${candidates.join(', ')}`
    );
  }
  return matched;
}

function normalizeNpsHeaders(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...raw };

  if (normalized['Detractor Calling'] === undefined && normalized['Dectractor Calling'] !== undefined) {
    normalized['Detractor Calling'] = normalized['Dectractor Calling'];
  }
  if (normalized['SMT/FP'] === undefined && normalized['SP / FP'] !== undefined) {
    normalized['SMT/FP'] = normalized['SP / FP'];
  }

  return normalized;
}

/** '1'..'5' → 1..5; anything else ("No Response", "LS", blank) → null. */
function parseRating(response: unknown): number | null {
  if (response === null || response === undefined) return null;
  const s = String(response).trim();
  return /^[1-5]$/.test(s) ? parseInt(s, 10) : null;
}

/** "None"/blank → null (not a detractor callback); otherwise the reason text as-is. */
function normalizeDetractorReason(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s.toLowerCase() === 'none' ? null : s;
}

/** "SP"/"FP" → kept as-is; anything else (blank, or the column absent that month) → null. */
function normalizeDeviceCategory(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toUpperCase();
  if (s === 'SP' || s === 'TAB' || s === 'TABLET' || s.includes('SMART') || s.includes('TABLET')) return 'SP';
  if (s === 'FP' || s.includes('FEATURE')) return 'FP';
  return null;
}

export async function importNpsSurvey(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const sheetNames = await listSheetNames(buffer);
  const rawSheetName = selectRawSheetName(sheetNames, filename);

  const rawRows = await parseFile(buffer, safeFilename, rawSheetName);
  const mappedRows = rawRows.map((r) => mapRow(normalizeNpsHeaders(r), NPS_FIELD_MAP));

  const validRows: { data: ReturnType<typeof NpsRowSchema.parse>; raw: Record<string, unknown> }[] = [];
  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  mappedRows.forEach((mapped, i) => {
    const result = NpsRowSchema.safeParse(mapped);
    if (result.success) {
      validRows.push({ data: result.data, raw: mapped['_raw'] as Record<string, unknown> });
    } else {
      rejectedRows.push({ rowIndex: i, errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) });
    }
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'NPS_SURVEY',
      importedBy: uploadedByUserId,
      rowCount: validRows.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();

  // No dedicated Month column — month is derived per row from Delivery Date.
  const fileMonths = sortMonths(
    validRows.map(({ data }) => normalizeMonth(toDate(data.deliveryDate))).filter((m): m is string => m !== null)
  );
  let replacedMonths: string[] = [];
  let addedMonths: string[] = fileMonths;

  try {
    if (fileMonths.length > 0) {
      const existing = await prisma.npsSurveyRecord.findMany({
        where: { month: { in: fileMonths } }, select: { month: true }, distinct: ['month'],
      });
      ({ replacedMonths, addedMonths } = splitReplacedAdded(fileMonths, existing.map((r) => r.month!).filter(Boolean)));
      await prisma.npsSurveyRecord.deleteMany({ where: { month: { in: fileMonths } } });
    }

    const recordsToInsert = [];
    for (const { data, raw } of validRows) {
      const scId = await resolveServiceCentre(caches, data.busmName ?? null, data.asmName ?? null, data.aspCode ?? null, data.aspName ?? null);
      const deliveryDate = toDate(data.deliveryDate);
      const month = normalizeMonth(deliveryDate);

      recordsToInsert.push({
        importId: monthlyImport.id,
        serviceCentreId: scId,
        workOrderNumber: data.workOrderNumber != null ? String(data.workOrderNumber) : null,
        callType: data.callType ?? null,
        callCategory: data.callCategory ?? null,
        deviceCategory: normalizeDeviceCategory(data.deviceCategory),
        response: data.response != null ? String(data.response) : null,
        rating: parseRating(data.response),
        detractorReason: normalizeDetractorReason(data.detractorReason),
        month,
        rawData: raw as object,
      });
    }

    const BATCH_SIZE = 2000;
    for (let start = 0; start < recordsToInsert.length; start += BATCH_SIZE) {
      const batch = recordsToInsert.slice(start, start + BATCH_SIZE);
      await prisma.npsSurveyRecord.createMany({
        data: batch,
      });
    }

    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'COMPLETE', completedAt: new Date() } });
    await recomputeAspMonthRollups(fileMonths);
    await invalidateDashboardCache();
  } catch (err) {
    await prisma.monthlyImport.update({ where: { id: monthlyImport.id }, data: { status: 'FAILED' } });
    throw err;
  }

  logger.info('NPS survey import complete', { importId: monthlyImport.id, valid: validRows.length, rejected: rejectedRows.length, replacedMonths, addedMonths, sheet: rawSheetName });

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
