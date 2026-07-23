import { Request, Response } from 'express';
import { processImport } from '../services/import.service';
import { importComplianceQc } from '../services/importers/qc.importer';
import { importComplianceEls } from '../services/importers/els.importer';
import { importComplianceDef } from '../services/importers/def.importer';
import { importComplianceCombined } from '../services/importers/compliance.importer';
import { importServiceAtHome } from '../services/importers/sah.importer';
import { importMsmAchievement } from '../services/importers/msm.importer';
import { importSparePriceCatalog } from '../services/importers/zprp.importer';
import { createAuditLog } from './audit.controller';
import prisma from '../configs/prisma.config';
import { sortMonths } from '../services/monthReplace.util';
import logger from '../configs/logger.config';

/**
 * Import Controller — Lava Decision Risk
 *
 * Handles CSV/XLSX file uploads from clients for any of the 6 Lava data files,
 * dispatching to the matching importer by `datasetType` (an explicit form
 * field, not header-sniffing — column names have already changed once and
 * will again, so the client always states which file it's sending).
 */

const DATASET_IMPORTERS: Record<string, (buffer: Buffer, filename: string, userId: string) => Promise<{ importId: string; rowCount: number }>> = {
  MASTER_DATA: processImport,
  // COMPLIANCE_COMBINED handles all 3 Compliance sheets from one uploaded file —
  // the preferred path for the admin UI. The 3 individual sheet types remain
  // available for programmatic/single-sheet re-imports.
  COMPLIANCE_COMBINED: importComplianceCombined,
  COMPLIANCE_QC: importComplianceQc,
  COMPLIANCE_ELS_DOA: importComplianceEls,
  COMPLIANCE_DEFECTIVE_SPARE: importComplianceDef,
  SERVICE_AT_HOME: importServiceAtHome,
  MSM_ACHIEVEMENT: importMsmAchievement,
  SPARE_PRICE_CATALOG: importSparePriceCatalog,
};

export async function uploadImportHandler(req: Request, res: Response): Promise<void> {
  const file = req.file;

  if (!file) {
    res.error({
      code: 400,
      message: 'No file uploaded. Please upload a CSV or XLSX file.',
    });
    return;
  }

  // auth.middleware.ts deliberately lets a super-admin token through even
  // without a conventional id/sub/_id/user_id claim (req.user.id ends up ''
  // in that case) — this check must recognize the same exception, or every
  // super-admin upload (no ordinary userId in the token) 401s here even
  // though authentication itself succeeded.
  if (!req.user || (!req.user.id && req.user.is_super_admin !== true)) {
    res.error({
      code: 401,
      message: 'Unauthorized. User information is missing from the request.',
    });
    return;
  }

  const datasetType = String(req.body?.datasetType ?? '');
  const importer = DATASET_IMPORTERS[datasetType];

  if (!importer) {
    res.error({
      code: 400,
      message: `Invalid or missing datasetType. Expected one of: ${Object.keys(DATASET_IMPORTERS).join(', ')}.`,
    });
    return;
  }

  try {
    logger.info(
      'Received file upload request',
      { filename: file.originalname, sizeBytes: file.size, datasetType, userId: req.user.id }
    );

    const summary = await importer(file.buffer, file.originalname, req.user.id);

    await createAuditLog({
      userId: req.user.id,
      action: 'IMPORT_UPLOAD',
      resourceType: 'MonthlyImport',
      resourceId: summary.importId,
      importId: summary.importId,
      metadata: { filename: file.originalname, datasetType, rowCount: summary.rowCount },
      ipAddress: req.ip,
    });

    res.success({
      code: 201,
      message: 'File imported and processed successfully',
      result: summary,
    });
  } catch (error) {
    logger.error('Error processing file import', { error, filename: file.originalname, datasetType });
    res.error({
      code: 500,
      message: 'An error occurred during file ingestion and rule scoring.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * GET /api/v1/imports/status
 *
 * Reports, per dataset the UI exposes, which months currently hold data and the
 * total row count — so the upload panel can show "Currently loaded: Apr, May,
 * Jun 2026" per card before the admin uploads. COMPLIANCE_COMBINED unions the 3
 * compliance tables; SPARE_PRICE_CATALOG is not month-scoped (count only).
 */
export async function importStatusHandler(_req: Request, res: Response): Promise<void> {
  const distinctMonths = async (
    rows: Promise<{ month: string | null }[]>
  ): Promise<string[]> => sortMonths((await rows).map((r) => r.month).filter((m): m is string => !!m));

  const [
    masterMonths, masterCount,
    qcMonths, qcCount,
    elsMonths, elsCount,
    defMonths, defCount,
    sahMonths, sahCount,
    msmMonths, msmCount,
    zprpCount,
  ] = await Promise.all([
    distinctMonths(prisma.workOrder.findMany({ select: { month: true }, distinct: ['month'] })),
    prisma.workOrder.count(),
    distinctMonths(prisma.complianceQcRecord.findMany({ select: { month: true }, distinct: ['month'] })),
    prisma.complianceQcRecord.count(),
    distinctMonths(prisma.complianceElsDoaRecord.findMany({ select: { month: true }, distinct: ['month'] })),
    prisma.complianceElsDoaRecord.count(),
    distinctMonths(prisma.complianceDefectiveSpareRecord.findMany({ select: { month: true }, distinct: ['month'] })),
    prisma.complianceDefectiveSpareRecord.count(),
    distinctMonths(prisma.serviceAtHomeAppointment.findMany({ select: { month: true }, distinct: ['month'] })),
    prisma.serviceAtHomeAppointment.count(),
    distinctMonths(prisma.msmDailyRecord.findMany({ select: { month: true }, distinct: ['month'] })),
    prisma.msmDailyRecord.count(),
    prisma.sparePriceCatalog.count(),
  ]);

  const complianceMonths = sortMonths([...qcMonths, ...elsMonths, ...defMonths]);

  res.success({
    message: 'Import status',
    result: {
      MASTER_DATA:         { months: masterMonths, rowCount: masterCount },
      COMPLIANCE_COMBINED: { months: complianceMonths, rowCount: qcCount + elsCount + defCount },
      SERVICE_AT_HOME:     { months: sahMonths, rowCount: sahCount },
      MSM_ACHIEVEMENT:     { months: msmMonths, rowCount: msmCount },
      SPARE_PRICE_CATALOG: { months: null, rowCount: zprpCount },
    },
  });
}
