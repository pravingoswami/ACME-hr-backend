import { ZipArchive } from "archiver";
import { NextFunction, Request, Response } from "express";
import * as salarySlipService from "../services/salarySlip.service";
import { getParamId } from "../utils/params";
import { bulkSalarySlipZipFilename } from "../utils/salarySlipPeriod";
import { sendError } from "../utils/response";
import {
  bulkSalarySlipSchema,
  salarySlipQuerySchema,
} from "../validators/salarySlip.validator";

export async function downloadEmployeeSalarySlip(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const queryResult = salarySlipQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return sendError(
        res,
        queryResult.error.errors.map((e) => e.message).join(", "),
        422,
      );
    }

    const employeeId = getParamId(req.params.id);
    const { filename, buffer } = await salarySlipService.generateEmployeeSalarySlip(
      employeeId,
      queryResult.data.month,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function downloadBulkSalarySlips(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bodyResult = bulkSalarySlipSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return sendError(
        res,
        bodyResult.error.errors.map((e) => e.message).join(", "),
        422,
      );
    }

    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const bulkResult = await salarySlipService.generateBulkSalarySlips(
      bodyResult.data,
      req.user.id,
    );

    const zipFilename = bulkSalarySlipZipFilename(bodyResult.data.month);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);

    const archive = new ZipArchive({ zlib: { level: 6 } });

    archive.on("error", (err: Error) => {
      next(err);
    });

    archive.pipe(res);

    await salarySlipService.appendEmployeeSlipsToArchive(
      bulkResult.employees,
      bodyResult.data.month,
      (buffer, filename) => {
        archive.append(buffer, { name: filename });
      },
    );

    await archive.finalize();
  } catch (error) {
    next(error);
  }
}
