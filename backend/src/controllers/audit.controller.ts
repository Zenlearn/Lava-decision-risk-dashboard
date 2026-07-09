import { Request, Response } from 'express';
import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';

/**
 * Log an audit action to the database.
 */
export async function createAuditLog(params: {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  importId?: string;
  metadata?: any;
  ipAddress?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        zenlearnUserId: params.userId,
        action:         params.action,
        resourceType:   params.resourceType || null,
        resourceId:     params.resourceId || null,
        importId:       params.importId || null,
        metadata:       params.metadata || null,
        ipAddress:      params.ipAddress || null,
      },
    });
  } catch (error) {
    logger.error('Failed to write audit log entry', { error, params });
  }
}

/**
 * GET /api/v1/audit
 *
 * Query params:
 *   - limit (default 50)
 *   - offset (default 0)
 *   - action (filter)
 *   - userId (filter)
 */
export async function getAuditLogsHandler(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
    const actionFilter = req.query.action as string | undefined;
    const userIdFilter = req.query.userId as string | undefined;

    const whereClause: any = {};

    if (actionFilter) {
      whereClause.action = actionFilter;
    }
    if (userIdFilter) {
      whereClause.zenlearnUserId = userIdFilter;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({
        where: whereClause,
      }),
    ]);

    res.success({
      code: 200,
      message: 'Audit logs retrieved successfully',
      result: {
        logs,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    logger.error('Error fetching audit logs', { error });
    res.error({
      code: 500,
      message: 'An error occurred while fetching audit logs.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
