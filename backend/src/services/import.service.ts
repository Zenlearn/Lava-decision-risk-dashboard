import path from 'path';
import ExcelJS from 'exceljs';
import { parse as parseCsv } from 'csv-parse/sync';
import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';
import { FIELD_MAP, TARGET_MONTHS } from '../configs/fieldMap.config';
import { ImportRowSchema, ImportRow, RowValidationResult } from '../schemas/import.schema';
import { runRuleEngine, RowRuleResult } from '../rules/engine';
import { invalidateDashboardCache } from './cache.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImportSummary {
  importId:      string;
  filename:      string;
  rowCount:      number;       // rows parsed from file (after month filter)
  validCount:    number;       // rows that passed Zod validation
  rejectedCount: number;       // rows that failed Zod (returned to caller)
  hitListCount:  number;       // rows with totalAnomalies >= 2
  hitList:       HitListItem[];// first 20 hit-list rows for immediate display
  rejectedRows:  RejectedRow[];
  processingMs:  number;
}

export interface HitListItem {
  workorder:      string | number | null;
  aspName:        string | null;
  customerCity:   string | null;
  imei:           string | null;
  symptomDesc:    string | null;
  totalAnomalies: number;
  flags: {
    repeatImei:       boolean;
    suspiciousPhone:  boolean;
    processBreakdown: boolean;
  };
}

export interface RejectedRow {
  rowIndex: number;
  errors:   string[];
}

// ─── File parsing ─────────────────────────────────────────────────────────────

/** Parse a buffer into an array of raw objects (one per data row). */
async function parseFile(buffer: Buffer, filename: string): Promise<Record<string, unknown>[]> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    const records = parseCsv(buffer, {
      columns: true,          // use first row as headers
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
    }) as Record<string, unknown>[];
    return records;
  }

  // XLSX / XLS - Use ExcelJS
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('Excel file has no worksheets');

  const records: Record<string, unknown>[] = [];
  
  // Extract headers from the first row
  const headers: string[] = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cell.text ? cell.text.trim() : '';
  });

  // Parse remaining rows
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header row
    const record: Record<string, unknown> = {};
    let hasData = false;

    // ExcelJS cell numbers are 1-based
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        let val: any = cell.value;
        // Handle formula values, rich text, objects, dates
        if (val && typeof val === 'object') {
          if (val.formula) {
            val = val.result !== undefined ? val.result : null;
          } else if (val.richText) {
            val = val.richText.map((t: any) => t.text || '').join('');
          } else if (val instanceof Date) {
            // Keep date objects
          } else if (val.text !== undefined) {
            val = val.text;
          } else {
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

/** Map a raw row's spreadsheet column names → logical field names via FIELD_MAP. */
function mapRow(raw: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [logicalKey, columnName] of Object.entries(FIELD_MAP)) {
    mapped[logicalKey] = raw[columnName] ?? null;
  }
  // Keep the original raw data for storage in WorkOrder.rawData
  mapped['_raw'] = raw;
  return mapped;
}

/** Validate a mapped row with Zod. Returns parsed data or errors. */
function validateRow(mapped: Record<string, unknown>, rowIndex: number): RowValidationResult {
  const result = ImportRowSchema.safeParse(mapped);
  if (result.success) {
    return { rowIndex, valid: true, data: result.data };
  }
  return {
    rowIndex,
    valid: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
}

// ─── Org hierarchy upsert helpers ─────────────────────────────────────────────

/** Upsert a Region from BUSM data. Returns regionId. */
async function upsertRegion(busmCode: string | null, busmName: string | null): Promise<string> {
  const name = busmName ?? busmCode ?? 'Unknown Region';
  const code = busmCode ?? null;

  const region = await prisma.region.upsert({
    where:  { name },
    create: { name, code },
    update: { code },
    select: { id: true },
  });
  return region.id;
}

/** Upsert a Dealer (ASM) under a Region. Returns dealerId. */
async function upsertDealer(
  asmCode: string | null,
  asmName: string | null,
  regionId: string
): Promise<string> {
  const name = asmName ?? asmCode ?? 'Unknown Dealer';
  const code = asmCode ?? null;

  const existing = await prisma.dealer.findFirst({
    where: { name, regionId },
    select: { id: true },
  });

  if (existing) {
    if (code) {
      await prisma.dealer.update({
        where: { id: existing.id },
        data: { code },
      });
    }
    return existing.id;
  }

  const created = await prisma.dealer.create({
    data: { name, code, regionId },
    select: { id: true },
  });
  return created.id;
}

/** Upsert a ServiceCentre (ASP) under a Dealer. Returns serviceCentreId. */
async function upsertServiceCentre(
  serviceCentreId: string | number | null,
  aspName:         string | null,
  dealerId:        string
): Promise<string> {
  const code = serviceCentreId != null ? String(serviceCentreId) : null;
  const name = aspName ?? code ?? 'Unknown Service Centre';

  const whereClause = [];
  if (code) {
    whereClause.push({ code, dealerId });
  }
  whereClause.push({ name, dealerId });

  const existing = await prisma.serviceCentre.findFirst({
    where: {
      OR: whereClause,
    },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.serviceCentre.create({
    data: { name, code, dealerId },
    select: { id: true },
  });
  return created.id;
}

// ─── Main import function ─────────────────────────────────────────────────────

/**
 * Full import pipeline:
 *   Parse → Map → Filter months → Validate → Run rules → Persist → Return summary
 */
export async function processImport(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<ImportSummary> {
  const startMs = Date.now();

  // Sanitise filename: strip path components and unsafe characters before DB storage
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);
  logger.info('Import pipeline started', { filename: safeFilename });

  // 1. Parse file
  const rawRows = await parseFile(buffer, safeFilename);
  logger.info('File parsed', { rowsParsed: rawRows.length });


  // 2. Map column names and apply month filter if configured
  let mappedRows = rawRows.map(mapRow);
  const targetMonths = TARGET_MONTHS;
  if (targetMonths && targetMonths.length > 0) {
    mappedRows = mappedRows.filter((r) => {
      const month = r['month'];
      return month && targetMonths.includes(String(month).trim().slice(0, 3));
    });
    logger.info('Month filter applied', { rowsAfterMonthFilter: mappedRows.length, targetMonths });
  }

  // 3. Validate rows with Zod
  const validationResults: RowValidationResult[] = mappedRows.map((mapped, i) =>
    validateRow(mapped, i)
  );

  const validRows:    ImportRow[]    = [];
  const rawDataMap:   Map<number, Record<string, unknown>> = new Map();
  const rejectedRows: RejectedRow[]  = [];

  validationResults.forEach((result, i) => {
    if (result.valid && result.data) {
      validRows.push(result.data);
      const rawData = mappedRows[i] ? (mappedRows[i]['_raw'] as Record<string, unknown>) : null;
      rawDataMap.set(validRows.length - 1, rawData ?? {});
    } else {
      rejectedRows.push({ rowIndex: result.rowIndex, errors: result.errors ?? [] });
    }
  });

  logger.info('Validation complete', { valid: validRows.length, rejected: rejectedRows.length });

  // 4. Run rule engine across all valid rows
  const ruleResults: RowRuleResult[] = runRuleEngine(validRows);
  const hitListResults = ruleResults.filter((r) => r.isHitList);
  logger.info('Rule engine complete', { hitListCount: hitListResults.length });

  // 5. Create MonthlyImport record
  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename:      safeFilename,
      importedBy:    uploadedByUserId,
      rowCount:      validRows.length,
      rejectedCount: rejectedRows.length,
      status:        'PROCESSING', // Enum is UPPERCASE in Prisma: PENDING | PROCESSING | COMPLETE | FAILED
    },
  });

  // 6. Persist org hierarchy + WorkOrders in a single transaction
  // Pre-build a cache of org IDs to avoid redundant upserts inside the loop
  const regionCache      = new Map<string, string>();
  const dealerCache      = new Map<string, string>();
  const scCache          = new Map<string, string>();

  try {
    // Phase 1: Upsert all org nodes first (outside the big tx to avoid long lock)
    for (const row of validRows) {
      const regionKey = row.busmCode ?? row.busmName ?? 'UNKNOWN';
      if (!regionCache.has(regionKey)) {
        regionCache.set(regionKey, await upsertRegion(row.busmCode ?? null, row.busmName ?? null));
      }

      const dealerKey = row.asmCode ?? row.asmName ?? 'UNKNOWN';
      if (!dealerCache.has(dealerKey)) {
        dealerCache.set(
          dealerKey,
          await upsertDealer(row.asmCode ?? null, row.asmName ?? null, regionCache.get(regionKey)!)
        );
      }

      const scKey = row.serviceCentreId != null ? String(row.serviceCentreId) : (row.aspName ?? 'UNKNOWN');
      if (!scCache.has(scKey)) {
        scCache.set(
          scKey,
          await upsertServiceCentre(
            row.serviceCentreId ?? null,
            row.aspName ?? null,
            dealerCache.get(dealerKey)!
          )
        );
      }
    }

    // Phase 2: Persist WorkOrders + RiskFlags + JudgementScores in batches
    // We avoid a single massive transaction (37k rows) — instead batch by 500
    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batchRows    = validRows.slice(start, start + BATCH_SIZE);
      const batchResults = ruleResults.slice(start, start + BATCH_SIZE);

      await prisma.$transaction(
        batchRows.map((row, bi) => {
          const result   = batchResults[bi]!;
          const scKey    = row.serviceCentreId != null ? String(row.serviceCentreId) : (row.aspName ?? 'UNKNOWN');
          const scId     = scCache.get(scKey)!;
          const rawData  = rawDataMap.get(start + bi) ?? {};

          return prisma.workOrder.create({
            data: {
              importId:        monthlyImport.id,
              serviceCentreId: scId,
              month:           row.month,
              rawData:         rawData as object,
              skillScore:      result.skillScore,
              auditScore:      result.auditScore,
              processScore:    result.processScore,
              totalAnomalies:  result.totalAnomalies,
              riskFlags: {
                create: Object.entries(result.flags)
                  .filter(([, f]) => f.flagged)
                  .map(([ruleKey, f]) => ({
                    ruleKey,
                    severity: 'MEDIUM', // Use UPPERCASE Enum value matching schema.prisma Severity: LOW | MEDIUM | HIGH | CRITICAL
                    evidence: f.evidence as object,
                  })),
              },
              judgementScores: {
                create: [
                  { dimension: 'SKILL',   score: result.skillScore,   penalty: result.flags.repeatImei.penalty },
                  { dimension: 'AUDIT',   score: result.auditScore,   penalty: result.flags.suspiciousPhone.penalty },
                  { dimension: 'PROCESS', score: result.processScore, penalty: result.flags.processBreakdown.penalty },
                ],
              },
            },
          });
        })
      );
    }

    // 7. Mark import as done
    await prisma.monthlyImport.update({
      where: { id: monthlyImport.id },
      data:  { status: 'COMPLETE', completedAt: new Date() }, // Status enum is COMPLETE
    });

    // Invalidate the cache to force recalculation on next dashboard request
    await invalidateDashboardCache();

    logger.info('Import persisted successfully', { importId: monthlyImport.id });
  } catch (err) {
    await prisma.monthlyImport.update({
      where: { id: monthlyImport.id },
      data:  { status: 'FAILED' },
    });
    throw err;
  }

  // 8. Build hit list preview (first 20 for immediate display)
  const hitList: HitListItem[] = hitListResults.slice(0, 20).map((result) => {
    const row = validRows[result.rowIndex]!;
    return {
      workorder:      row.workorder ?? null,
      aspName:        row.aspName   ?? null,
      customerCity:   row.customerCity ?? null,
      imei:           row.imei,
      symptomDesc:    row.symptomDesc ?? null,
      totalAnomalies: result.totalAnomalies,
      flags: {
        repeatImei:       result.flags.repeatImei.flagged,
        suspiciousPhone:  result.flags.suspiciousPhone.flagged,
        processBreakdown: result.flags.processBreakdown.flagged,
      },
    };
  });

  const processingMs = Date.now() - startMs;
  logger.info('Import pipeline complete', { importId: monthlyImport.id, processingMs });

  return {
    importId:      monthlyImport.id,
    filename:      safeFilename,
    rowCount:      mappedRows.length,
    validCount:    validRows.length,
    rejectedCount: rejectedRows.length,
    hitListCount:  hitListResults.length,
    hitList,
    rejectedRows:  rejectedRows.slice(0, 50), // cap rejection detail at 50 rows
    processingMs,
  };
}
