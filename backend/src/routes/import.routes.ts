import { Router } from 'express';
import multer from 'multer';
import { uploadImportHandler } from '../controllers/import.controller';
import { asyncHandler } from '../configs/async.config';

import { requireAnyLavaRole } from '../middlewares/rbac.middleware';

const importRouter = Router();

// Only top management and admin roles can upload data files
const importAllowedRoles: any[] = ['Admin', 'MD', 'ServiceHead', 'RegionalHead'];


// Configure Multer for file uploads in memory (since we parse in-request)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept CSV and Excel mime types
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimeTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, XLS, and XLSX file formats are supported.'));
    }
  },
});

/**
 * POST /api/v1/imports
 * 
 * Ingests a monthly master service data file (CSV or XLSX), validates it,
 * runs the anomaly detection rule engine, and persists the generated
 * workorders, risk flags, and judgement scores in Postgres.
 * 
 * Access control is handled by the parent router mounting (app.ts/index.ts)
 * where AuthMiddleware is already applied.
 */
importRouter.post(
  '/',
  requireAnyLavaRole(importAllowedRoles),
  upload.single('file'),
  asyncHandler(uploadImportHandler)
);

export default importRouter;
