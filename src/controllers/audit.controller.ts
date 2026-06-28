import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/audit.service";
import { parsePaginationQuery, buildPaginationMeta } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
    const { total, items } = await auditService.getAuditLogsPaginated(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );

    return sendSuccess(res, {
      items,
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    });
  } catch (error) {
    next(error);
  }
}
