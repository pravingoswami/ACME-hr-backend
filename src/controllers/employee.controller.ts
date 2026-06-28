import { Request, Response, NextFunction } from "express";
import * as employeeService from "../services/employee.service";
import { getParamId } from "../utils/params";
import { parsePaginationQuery } from "../utils/pagination";
import { sendError, sendSuccess } from "../utils/response";

export async function listEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
    const result = await employeeService.getEmployeesPaginated(pagination);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.getEmployeeById(getParamId(req.params.id));
    return sendSuccess(res, employee);
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return sendSuccess(res, employee, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.updateEmployee(getParamId(req.params.id), req.body);
    return sendSuccess(res, employee);
  } catch (error) {
    next(error);
  }
}

export async function removeEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    await employeeService.deleteEmployee(getParamId(req.params.id));
    return sendSuccess(res, { message: "Employee deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeByIdParam(req: Request, res: Response, next: NextFunction) {
  if (!req.params.id) {
    return sendError(res, "Employee id is required", 400);
  }
  next();
}
