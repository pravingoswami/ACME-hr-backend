import { Role } from "../types/enums";
import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", 403);
    }

    next();
  };
}

export function canManageUsers(role: Role): boolean {
  return role === Role.ADMIN || role === Role.HR_MANAGER;
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN;
}
