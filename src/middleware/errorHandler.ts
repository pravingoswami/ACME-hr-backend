import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Error) {
    if (err.message === "User not found" || err.message === "Employee not found" ||
        err.message === "Import job not found" || err.message === "Export job not found" ||
        err.message === "Export file not found" ||
        err.message === "No employees matched the bulk salary slip criteria") {
      return sendError(res, err.message, 404);
    }
    if (err.message === "Email already in use" || err.message === "Employee code already in use") {
      return sendError(res, err.message, 409);
    }
    if (err.message === "Invalid email or password" || err.message === "Invalid or expired refresh token") {
      return sendError(res, err.message, 401);
    }
    if (
      err.message === "Admin account cannot be modified" ||
      err.message === "Admin account cannot be deleted" ||
      err.message === "You do not have permission to perform this action" ||
      err.message === "Export download link has expired"
    ) {
      return sendError(res, err.message, 403);
    }
    if (err.message === "JWT_SECRET is not configured") {
      return sendError(res, "Server configuration error", 500);
    }
    if (err.message.startsWith("Invalid month format")) {
      return sendError(res, err.message, 422);
    }
    if (err.message === "Export is not ready yet") {
      return sendError(res, err.message, 400);
    }
    return sendError(res, err.message, 500);
  }

  return sendError(res, "Internal server error", 500);
}
