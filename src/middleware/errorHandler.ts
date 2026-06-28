import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Error) {
    if (err.message === "User not found" || err.message === "Employee not found") {
      return sendError(res, err.message, 404);
    }
    if (err.message === "Email already in use" || err.message === "Employee code already in use") {
      return sendError(res, err.message, 409);
    }
    if (err.message === "Invalid email or password") {
      return sendError(res, err.message, 401);
    }
    if (err.message === "Admin account cannot be modified" || err.message === "Admin account cannot be deleted") {
      return sendError(res, err.message, 403);
    }
    if (err.message === "JWT_SECRET is not configured") {
      return sendError(res, "Server configuration error", 500);
    }
    return sendError(res, err.message, 500);
  }

  return sendError(res, "Internal server error", 500);
}
