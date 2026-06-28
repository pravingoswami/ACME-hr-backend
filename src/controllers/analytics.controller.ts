import { Request, Response, NextFunction } from "express";
import * as analyticsService from "../services/analytics.service";
import { sendSuccess } from "../utils/response";
import { analyticsQuerySchema } from "../validators/salary.validator";

function parseAnalyticsQuery(req: Request) {
  return analyticsQuerySchema.parse(req.query);
}

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseAnalyticsQuery(req);
    const data = await analyticsService.getAnalyticsSummary(filters);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function byDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseAnalyticsQuery(req);
    const data = await analyticsService.getAnalyticsByDepartment(filters);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function byStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseAnalyticsQuery(req);
    const data = await analyticsService.getAnalyticsByStatus(filters);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function payRange(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseAnalyticsQuery(req);
    const data = await analyticsService.getPayRange(filters);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
