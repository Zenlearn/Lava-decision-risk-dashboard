import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { uploadImportHandler } from '../controllers/import.controller';
import { asyncHandler } from '../configs/async.config';

import { requireAnyLavaRole } from '../middlewares/rbac.middleware';

const importRouter = Router();

// Only top management and admin roles can upload data files
const importAllowedRoles: any[] = ['Admin', 'MD', 'ServiceHead', 'RegionalHead'];

// Per-route limiter on top of the global one — uploads are parsed/scored
// synchronously (see ARCHITECTURE.md §7), so this is the endpoint most exposed
// to abuse-driven CPU/memory pressure. Matches PathwaysBackend's uploadLimiter
// convention (per-route limiter on upload/AI endpoints).
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many import uploads from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// Configure Multer for file uploads in memory (since we parse in-request)
// 25 MB — the Jul 2026 Master Data file alone is ~15.4 MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
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
 * Ingests any of the 6 Lava data files (CSV or XLSX): Master Data, Compliance
 * IMEI QC / DEF(S+D) / ELS DOA REP, Service at Home, MSM Achievement, or ZPRP
 * Spare Cost. The client must send a `datasetType` form field alongside the
 * file (see DATASET_IMPORTERS in import.controller.ts for valid values) —
 * dataset type is never auto-detected from headers, since column names have
 * already changed once in this project and will again.
 *
 * Access control is handled by the parent router mounting (app.ts/index.ts)
 * where AuthMiddleware is already applied.
 */
importRouter.post(
  '/',
  uploadLimiter,
  requireAnyLavaRole(importAllowedRoles),
  upload.single('file'),
  asyncHandler(uploadImportHandler)
);

export default importRouter;
