import { Request, Response, NextFunction } from "express";
import * as employeeService from "../services/employee.service";
import * as salaryService from "../services/salary.service";
import { getParamId } from "../utils/params";
import { parsePaginationQuery } from "../utils/pagination";
import { sendError, sendSuccess } from "../utils/response";
import { employeeListQuerySchema } from "../validators/employee.validator";

export async function listEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    const queryResult = employeeListQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return sendError(res, queryResult.error.errors.map((e) => e.message).join(", "), 422);
    }

    const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
    const result = await employeeService.getEmployeesPaginated(pagination, queryResult.data);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.getEmployeeById(getParamId(req.params.id));
    const salaryHistory = await salaryService.getSalaryHistory(employee.id);
    return sendSuccess(res, { ...employee, salaryHistory });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.createEmployee(req.body, req.user?.id);
    return sendSuccess(res, employee, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.updateEmployee(
      getParamId(req.params.id),
      req.body,
      req.user?.id,
    );
    return sendSuccess(res, employee);
  } catch (error) {
    next(error);
  }
}

export async function updateEmployeeSalary(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const record = await salaryService.updateEmployeeSalary(
      getParamId(req.params.id),
      req.body,
      req.user.id,
    );
    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
}

export async function removeEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    await employeeService.deleteEmployee(getParamId(req.params.id), req.user?.id);
    return sendSuccess(res, { message: "Employee deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function deactivateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.deactivateEmployee(
      getParamId(req.params.id),
      req.user?.id,
    );
    return sendSuccess(res, employee);
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

export async function getEmployeeSalaryHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const history = await salaryService.getSalaryHistory(getParamId(req.params.id));
    return sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
}
