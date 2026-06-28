import { Request, Response, NextFunction } from "express";
import * as importExportService from "../services/importExport.service";
import { getParamId } from "../utils/params";
import { sendError, sendSuccess } from "../utils/response";

export async function uploadImport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const file = req.file;
    if (!file) {
      return sendError(res, "CSV file is required", 400);
    }

    const job = await importExportService.createImportJob(
      req.user.id,
      file.originalname,
      file.buffer,
    );

    return sendSuccess(res, job, 201);
  } catch (error) {
    next(error);
  }
}

export async function processImport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const job = await importExportService.processImportJob(
      getParamId(req.params.jobId),
      req.user.id,
    );
    return sendSuccess(res, job);
  } catch (error) {
    next(error);
  }
}

export async function getImportStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await importExportService.getImportJobStatus(getParamId(req.params.jobId));
    return sendSuccess(res, job);
  } catch (error) {
    next(error);
  }
}

export async function createExport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const job = await importExportService.createExportJob(req.user.id, req.body.filters);
    return sendSuccess(res, job, 201);
  } catch (error) {
    next(error);
  }
}

export async function downloadExport(req: Request, res: Response, next: NextFunction) {
  try {
    const download = await importExportService.getExportDownload(getParamId(req.params.jobId));
    return res.download(download.filePath, download.fileName);
  } catch (error) {
    next(error);
  }
}
