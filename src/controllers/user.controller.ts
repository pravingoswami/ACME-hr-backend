import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { isAdmin } from "../middleware/authorize";
import { getParamId } from "../utils/params";
import { sendError, sendSuccess } from "../utils/response";
import { UpdateUserInput } from "../validators/user.validator";

function sanitizeSelfUpdateInput(input: UpdateUserInput): UpdateUserInput {
  const { isActive, ...selfUpdate } = input;
  return selfUpdate;
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !isAdmin(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", 403);
    }

    const users = await userService.getAllUsers();
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !isAdmin(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", 403);
    }

    const user = await userService.getUserById(getParamId(req.params.id));
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !isAdmin(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", 403);
    }

    const user = await userService.createHrManager(req.body);
    return sendSuccess(res, user, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getParamId(req.params.id);

    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (isAdmin(req.user.role)) {
      const user = await userService.updateUser(userId, req.body);
      return sendSuccess(res, user);
    }

    if (req.user.role === Role.HR_MANAGER) {
      if (req.user.id !== userId) {
        return sendError(res, "You can only update your own profile", 403);
      }

      const user = await userService.updateUser(userId, sanitizeSelfUpdateInput(req.body));
      return sendSuccess(res, user);
    }

    return sendError(res, "You do not have permission to perform this action", 403);
  } catch (error) {
    next(error);
  }
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !isAdmin(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action", 403);
    }

    const userId = getParamId(req.params.id);

    if (req.user.id === userId) {
      return sendError(res, "You cannot delete your own account", 400);
    }

    await userService.deleteUser(userId);
    return sendSuccess(res, { message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdParam(req: Request, res: Response, next: NextFunction) {
  if (!req.params.id) {
    return sendError(res, "User id is required", 400);
  }
  next();
}
