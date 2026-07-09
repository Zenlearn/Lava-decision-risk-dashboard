import { Request, Response } from 'express';
import { processImport } from '../services/import.service';
import logger from '../configs/logger.config';

/**
 * Import Controller — Lava Decision Risk
 * 
 * Handles CSV/XLSX file uploads from clients, processes them through the
 * scoring pipeline, and returns the import results including the action hit-list.
 */
export async function uploadImportHandler(req: Request, res: Response): Promise<void> {
  const file = req.file;

  if (!file) {
    res.error({
      code: 400,
      message: 'No file uploaded. Please upload a CSV or XLSX file.',
    });
    return;
  }

  // Ensure request has user identity from JWT
  if (!req.user || !req.user.id) {
    res.error({
      code: 401,
      message: 'Unauthorized. User information is missing from the request.',
    });
    return;
  }

  try {
    logger.info(
      'Received file upload request',
      { filename: file.originalname, sizeBytes: file.size, userId: req.user.id }
    );

    const summary = await processImport(file.buffer, file.originalname, req.user.id);

    res.success({
      code: 201,
      message: 'File imported and processed successfully',
      result: summary,
    });
  } catch (error) {
    logger.error('Error processing file import', { error, filename: file.originalname });
    res.error({
      code: 500,
      message: 'An error occurred during file ingestion and rule scoring.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
