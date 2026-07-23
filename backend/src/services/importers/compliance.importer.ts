import { persistComplianceQc } from './qc.importer';
import { persistComplianceEls } from './els.importer';
import { persistComplianceDef } from './def.importer';
import { parseWorkbookSheets } from '../../utils/fileParser.util';
import { sortMonths } from '../monthReplace.util';
import { DatasetImportSummary } from './types';
import logger from '../../configs/logger.config';

/**
 * Combined Compliance importer — processes ALL 3 sheets of the single Compliance
 * workbook ("IMEI QC", "DEF(S+D)", "ELS DOA REP") from ONE uploaded file, so the
 * admin UI needs a single upload slot for the Compliance file instead of three.
 *
 * The workbook is parsed ONCE (parseWorkbookSheets) — not re-loaded per sheet —
 * then each sheet's rows are handed to the matching persist function. Each sub-
 * importer still creates its own MonthlyImport row and triggers its own rollup
 * recompute, keeping them independently usable for single-sheet re-imports.
 *
 * Runs the three persist steps sequentially, not in parallel — all three
 * resolve/create the same ServiceCentres, and concurrent upserts on the same
 * ASP code would race.
 */
export async function importComplianceCombined(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();

  const sheets = await parseWorkbookSheets(buffer, ['IMEI QC', 'ELS DOA REP', 'DEF(S+D)']);

  const qc = await persistComplianceQc(sheets['IMEI QC']!, filename, uploadedByUserId);
  const els = await persistComplianceEls(sheets['ELS DOA REP']!, filename, uploadedByUserId);
  const def = await persistComplianceDef(sheets['DEF(S+D)']!, filename, uploadedByUserId);

  const parts = [qc, els, def];
  // Merge the 3 sheets' month sets. A month is "replaced" for the file if ANY
  // sheet had prior data for it; "added" only if no sheet did.
  const replacedSet = new Set<string>([...(qc.replacedMonths ?? []), ...(els.replacedMonths ?? []), ...(def.replacedMonths ?? [])]);
  const allMonths = new Set<string>([
    ...(qc.replacedMonths ?? []), ...(qc.addedMonths ?? []),
    ...(els.replacedMonths ?? []), ...(els.addedMonths ?? []),
    ...(def.replacedMonths ?? []), ...(def.addedMonths ?? []),
  ]);
  const replacedMonths = sortMonths(replacedSet);
  const addedMonths = sortMonths([...allMonths].filter((m) => !replacedSet.has(m)));

  const merged: DatasetImportSummary = {
    importId: qc.importId,
    filename: qc.filename,
    rowCount: parts.reduce((s, p) => s + p.rowCount, 0),
    validCount: parts.reduce((s, p) => s + p.validCount, 0),
    rejectedCount: parts.reduce((s, p) => s + p.rejectedCount, 0),
    // Prefix each sub-sheet's rejections so the UI can tell which sheet they came from.
    rejectedRows: [
      ...qc.rejectedRows.map((r) => ({ rowIndex: r.rowIndex, errors: r.errors.map((e) => `[IMEI QC] ${e}`) })),
      ...els.rejectedRows.map((r) => ({ rowIndex: r.rowIndex, errors: r.errors.map((e) => `[ELS DOA REP] ${e}`) })),
      ...def.rejectedRows.map((r) => ({ rowIndex: r.rowIndex, errors: r.errors.map((e) => `[DEF(S+D)] ${e}`) })),
    ].slice(0, 50),
    replacedMonths,
    addedMonths,
    processingMs: Date.now() - startMs,
  };

  logger.info('Combined Compliance import complete', {
    qcImportId: qc.importId,
    elsImportId: els.importId,
    defImportId: def.importId,
    totalValid: merged.validCount,
    totalRejected: merged.rejectedCount,
  });

  return merged;
}
