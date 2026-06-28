import { Request, Response, NextFunction } from "express";
import * as referenceService from "../services/reference.service";
import { sendSuccess } from "../utils/response";

export async function listCountries(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await referenceService.getCountries();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function listDepartments(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await referenceService.getDepartments();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function listJobGrades(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await referenceService.getJobGrades();
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
