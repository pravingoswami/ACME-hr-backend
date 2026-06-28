import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import * as userService from "../services/user.service";
import { sendSuccess } from "../utils/response";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshSession(req.body.refreshToken);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken);
    return sendSuccess(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.user!.id);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}
