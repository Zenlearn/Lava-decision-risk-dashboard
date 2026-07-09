import { Router } from 'express';
import { getAuditLogsHandler } from '../controllers/audit.controller';
import { requireAnyLavaRole } from '../middlewares/rbac.middleware';
import { asyncHandler } from '../configs/async.config';

const auditRouter = Router();

// Only admin and top management can query action audit logs
const auditAllowedRoles: any[] = ['Admin', 'MD', 'ServiceHead', 'RegionalHead'];

/**
 * GET /api/v1/audit
 *
 * Query system audit logs with limit, offset, and action/userId filters.
 */
auditRouter.get(
  '/', 
  requireAnyLavaRole(auditAllowedRoles),
  asyncHandler(getAuditLogsHandler)
);

export default auditRouter;
