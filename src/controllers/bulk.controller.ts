import { Request, Response, NextFunction } from "express";
import * as bulkService from "../services/bulk.service";
import { sendError, sendSuccess } from "../utils/response";

export async function previewAdjustment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bulkService.previewBulkAdjustment(req.body);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function applyAdjustment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const data = await bulkService.applyBulkAdjustment(req.body, req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
