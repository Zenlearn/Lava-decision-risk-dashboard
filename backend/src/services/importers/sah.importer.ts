import path from 'path';
import prisma from '../../configs/prisma.config';
import logger from '../../configs/logger.config';
import { SAH_FIELD_MAP } from '../../configs/fieldMap.config';
import { SahRowSchema } from '../../schemas/datasetImport.schema';
import { parseFile, mapRow, toDate, normalizeMonth } from '../../utils/fileParser.util';
import { newHierarchyCaches, resolveServiceCentre } from '../hierarchy.service';
import { recomputeAspMonthRollups } from '../rollup.service';
import { invalidateDashboardCache } from '../cache.service';
import { sortMonths, splitReplacedAdded } from '../monthReplace.util';
import { DatasetImportSummary } from './types';

/**
 * Imports the Service-at-Home appointment sheet — home-visit lifecycle data,
 * one of the 3 Process Score inputs (alongside TAT and MSM Achievement).
 *
 * NOTE: no Month column in this sheet — month is derived from Appointment Date.
 */
export async function importServiceAtHome(
  buffer: Buffer,
  filename: string,
  uploadedByUserId: string
): Promise<DatasetImportSummary> {
  const startMs = Date.now();
  const safeFilename = path.basename(filename).replace(/[^\w.\-]/g, '_').slice(0, 255);

  const rawRows = await parseFile(buffer, safeFilename);
  const mappedRows = rawRows.map((r) => mapRow(r, SAH_FIELD_MAP));

  const validRows: { data: ReturnType<typeof SahRowSchema.parse>; raw: Record<string, unknown> }[] = [];
  const rejectedRows: { rowIndex: number; errors: string[] }[] = [];

  mappedRows.forEach((mapped, i) => {
    const result = SahRowSchema.safeParse(mapped);
    if (result.success) {
      validRows.push({ data: result.data, raw: mapped['_raw'] as Record<string, unknown> });
    } else {
      rejectedRows.push({ rowIndex: i, errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`) });
    }
  });

  const monthlyImport = await prisma.monthlyImport.create({
    data: {
      filename: safeFilename,
      datasetType: 'SERVICE_AT_HOME',
      importedBy: uploadedByUserId,
      rowCount: validRows.length,
      rejectedCount: rejectedRows.length,
      status: 'PROCESSING',
    },
  });

  const caches = newHierarchyCaches();

  // S@H has no Month column — month is derived per row from Appointment Date.
  const fileMonths = sortMonths(
    validRows.map(({ data }) => normalizeMonth(toDate(data.appointmentDate))).filter((m): m is string => m !== null)
  );
  let replacedMonths: string[] = [];
  let addedMonths: string[] = fileMonths;

  try {
    if (fileMonths.length > 0) {
      const existing = await prisma.serviceAtHomeAppointment.findMany({
        where: { month: { in: fileMonths } }, select: { month: true }, distinct: ['month'],
      });
      ({ replacedMonths, addedMonths } = splitReplacedAdded(fileMonths, existing.map((r) => r.month!).filter(Boolean)));
      await prisma.serviceAtHomeAppointment.deleteMany({ where: { month: { in: fileMonths } } });
    }

    const BATCH_SIZE = 500;
    for (let start = 0; start < validRows.length; start += BATCH_SIZE) {
      const batch = validRows.slice(start, start + BATCH_SIZE);
      for (const { data, raw } of batch) {
        const scId = await resolveServiceCentre(caches, data.busmName ?? null, data.asmName ?? null, data.aspCode ?? null, data.aspName ?? null);
        const appointmentDate = toDate(data.appointmentDate);
        const month = normalizeMonth(appointmentDate);

        await prisma.serviceAtHomeAppointment.create({
          data: {
            importId: monthlyImport.id,
            serviceCentreId: scId,
            appointmentId: String(data.appointmentId),
            workOrderNumber: data.workOrderNumber != null ? String(data.workOrderNumber) : null,
            appointmentStatus: data.appointmentStatus ?? null,
            appointmentDate,
            cancelReason: data.cancelReason ?? null,
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

  logger.info('Service at Home import complete', { importId: monthlyImport.id, valid: validRows.length, rejected: rejectedRows.length, replacedMonths, addedMonths });

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
