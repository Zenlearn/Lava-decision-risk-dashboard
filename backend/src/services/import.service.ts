import path from 'path';
import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';
import { TARGET_MONTHS } from '../configs/fieldMap.config';
import { FIELD_MAP } from '../configs/fieldMap.config';
import { ImportRowSchema, ImportRow, RowValidationResult } from '../schemas/import.schema';
import { runRuleEngine, markCrossAspRows } from '../rules/engine';
import { MasterDataRuleRow, RowRuleResult } from '../rules/types';
import { invalidateDashboardCache } from './cache.service';
import { parseFile, mapRow, toNumber, normalizeMonth } from '../utils/fileParser.util';
import { newHierarchyCaches, resolveServiceCentre } from './hierarchy.service';
import { recomputeAspMonthRollups } from './rollup.service';
import { sortMonths, splitReplacedAdded } from './monthReplace.util';

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
  replacedMonths?: string[];   // months this upload replaced (had prior data)
  addedMonths?:    string[];   // months this upload added (no prior data)
  processingMs:  number;
}

export interface HitListItem {
  workorder:      string | number | null;
  aspName:        string | null;
  imei:           string | null;
  symptomDesc:    string | null;
  totalAnomalies: number;
  flags: {
    repeatImei:      boolean;
    doa:             boolean;
    suspiciousPhone: boolean;
  };
}

export interface RejectedRow {
  rowIndex: number;
  errors:   string[];
}

/** Map a validated ImportRow (Master Data) into the rule engine's input shape. */
function toMasterDataRuleRow(row: ImportRow, rowIndex: number): Omit<MasterDataRuleRow, 'isCrossAsp'> {
  return {
    rowIndex,
    imei: row.imei,
    phone: row.phone ?? null,
    doaType: row.doaType ?? null,
    actionDesc: row.actionDesc ?? null,
    symptomDesc: row.symptomDesc ?? null,
    callType: row.callType ?? null,
    callCategory: row.callCategory ?? null,
    creationDate: row.creationDate ?? null,
    deliveryDate: row.deliveryDate ?? null,
    pcbaConsumption: toNumber(row.pcbaConsumption),
    tpLcdConsumption: toNumber(row.tpLcdConsumption),
    batteryConsumption: toNumber(row.batteryConsumption),
    subPcbaConsumption: toNumber(row.subPcbaConsumption),
    accessoriesConsumption: toNumber(row.accessoriesConsumption),
    othersConsumption: toNumber(row.othersConsumption),
    totalPartValue: toNumber(row.totalPartValue),
    handsetValue: toNumber(row.handsetValue),
  };
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

// ─── Main import function (Master Data) ───────────────────────────────────────

/**
 * Full Master Data import pipeline:
 *   Parse → Map → Filter months → Validate → Resolve hierarchy → Run rules
 *   → Persist → Recompute affected AspMetricRollup rows → Return summary
 *
 * The other 5 dataset types (Compliance QC/ELS/DEF, S@H, MSM, ZPRP) each have
 * their own importer in services/importers/ — this file stays Master-Data-specific
 * since it's the only dataset with a row-level rule engine (Skill flags) and a
 * WorkOrder table to persist into.
 */
export async function processImport(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<ImportSummary> {
  const startMs = Date.now();

  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);
  logger.info('Import pipeline started', { filename: safeFilename });

  // 1. Parse file
  const rawRows = await parseFile(buffer, safeFilename);
  logger.info('File parsed', { rowsParsed: rawRows.length });

  // 2. Map column names and apply month filter if configured
  let mappedRows = rawRows.map((r) => mapRow(r, FIELD_MAP));
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
      // Normalize month to the canonical 3-letter form ('Apr'/'May'/'Jun') so
      // AspMetricRollup joins by (serviceCentreId, month) match across all 6
      // datasets — Master Data's raw month values ('April', 'May', 'June')
      // otherwise wouldn't match Compliance sheets' ("April'26" etc.) or S@H/MSM's
      // date-derived months. See normalizeMonth() in fileParser.util.ts.
      const normalizedMonth = normalizeMonth(result.data.month) ?? result.data.month;
      validRows.push({ ...result.data, month: normalizedMonth });
      const rawData = mappedRows[i] ? (mappedRows[i]['_raw'] as Record<string, unknown>) : null;
      rawDataMap.set(validRows.length - 1, rawData ?? {});
    } else {
      rejectedRows.push({ rowIndex: result.rowIndex, errors: result.errors ?? [] });
    }
  });

  logger.info('Validation complete', { valid: validRows.length, rejected: rejectedRows.length });

  // 4. Create MonthlyImport record
  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename:      safeFilename,
      datasetType:   'MASTER_DATA',
      importedBy:    uploadedByUserId,
      rowCount:      validRows.length,
      rejectedCount: rejectedRows.length,
      status:        'PROCESSING',
    },
  });

  // 5. Resolve org hierarchy + WorkOrders in a single transaction
  const caches = newHierarchyCaches();
  const serviceCentreIdByRow: string[] = [];
  let ruleResults: RowRuleResult[] = [];
  let hitListResults: RowRuleResult[] = [];

  // Months this file covers — the delete-then-replace scope (row.month is
  // already normalized to canonical 3-letter form during validation above).
  const fileMonths = sortMonths(
    validRows.map((r) => r.month).filter((m): m is string => !!m)
  );
  let replacedMonths: string[] = [];
  let addedMonths: string[] = fileMonths;

  try {
    // Phase 0: clear existing WorkOrders for the file's months (RiskFlags cascade)
    // so this upload is the complete truth for those months — no duplicates on
    // re-upload, correct replacement on overlapping-month re-uploads.
    if (fileMonths.length > 0) {
      const existing = await prisma.workOrder.findMany({
        where: { month: { in: fileMonths } }, select: { month: true }, distinct: ['month'],
      });
      ({ replacedMonths, addedMonths } = splitReplacedAdded(fileMonths, existing.map((r) => r.month!).filter(Boolean)));
      await prisma.workOrder.deleteMany({ where: { month: { in: fileMonths } } });
    }

    // Phase 1: Resolve org hierarchy first (outside the big tx to avoid long lock).
    // Runs BEFORE the rule engine because Cross-ASP-IMEI detection needs each
    // row's resolved serviceCentreId.
    for (const row of validRows) {
      const scId = await resolveServiceCentre(caches, row.busmName ?? null, row.asmName ?? null, row.aspCode ?? null, row.aspName ?? null);
      serviceCentreIdByRow.push(scId);
    }

    // Phase 2: Run the rule engine now that every row has a resolved serviceCentreId
    const masterRowsNoCrossAsp = validRows.map((row, i) => toMasterDataRuleRow(row, i));
    const masterRows = markCrossAspRows(masterRowsNoCrossAsp, serviceCentreIdByRow);
    ruleResults = runRuleEngine(masterRows);
    hitListResults = ruleResults.filter((r) => r.isHitList);
    logger.info('Rule engine complete', { hitListCount: hitListResults.length });

    // Phase 3: Persist WorkOrders + RiskFlags in batches
    // We avoid a single massive transaction (100K+ rows) — instead batch by 500
    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batchRows    = validRows.slice(start, start + BATCH_SIZE);
      const batchResults = ruleResults.slice(start, start + BATCH_SIZE);

      await prisma.$transaction(
        batchRows.map((row, bi) => {
          const result   = batchResults[bi]!;
          const scId     = serviceCentreIdByRow[start + bi]!;
          const rawData  = rawDataMap.get(start + bi) ?? {};

          // NOTE: Audit/Process scores are no longer per-row concepts — the new
          // rule engine computes them as ASP-month aggregates (AspMetricRollup),
          // joining in Compliance/S@H/MSM data that has no 1:1 WorkOrder relationship.
          // Only Skill (Repeat IMEI + DOA) is meaningful per individual workorder.
          return prisma.workOrder.create({
            data: {
              importId:        monthlyImport.id,
              serviceCentreId: scId,
              month:           row.month,
              rawData:         rawData as object,
              skillScore:      Math.max(0, 100 - result.skillPenalty),
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
            },
          });
        })
      );
    }

    // 6. Mark import as done
    await prisma.monthlyImport.update({
      where: { id: monthlyImport.id },
      data:  { status: 'COMPLETE', completedAt: new Date() },
    });

    // 7. Recompute AspMetricRollup for every month this import touched
    await recomputeAspMonthRollups(fileMonths);

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
      imei:           row.imei,
      symptomDesc:    row.symptomDesc ?? null,
      totalAnomalies: result.totalAnomalies,
      flags: {
        repeatImei:      result.flags.repeatImei.flagged,
        doa:             result.flags.doa.flagged,
        suspiciousPhone: result.flags.suspiciousPhone.flagged,
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
    replacedMonths,
    addedMonths,
    processingMs,
  };
}
