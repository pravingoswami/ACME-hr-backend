import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return sendError(res, "Authentication required", 401);
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}
