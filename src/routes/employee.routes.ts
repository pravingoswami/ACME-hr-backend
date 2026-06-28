import { Role } from "../types/enums";
import { Router } from "express";
import * as employeeController from "../controllers/employee.controller";
import { downloadEmployeeSalarySlip } from "../controllers/salarySlip.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../validators/employee.validator";
import { updateSalarySchema } from "../validators/salary.validator";

const router = Router();

const managers = [Role.ADMIN, Role.HR_MANAGER] as const;

router.use(authenticate);
router.use(authorize(...managers));

router.get("/", employeeController.listEmployees);
router.get("/:id/salary-history", employeeController.getEmployeeByIdParam, employeeController.getEmployeeSalaryHistory);
router.get("/:id/salary-slip", employeeController.getEmployeeByIdParam, downloadEmployeeSalarySlip);
router.get("/:id", employeeController.getEmployeeByIdParam, employeeController.getEmployee);
router.post("/", validateBody(createEmployeeSchema), employeeController.createEmployee);
router.put("/:id", employeeController.getEmployeeByIdParam, validateBody(updateEmployeeSchema), employeeController.updateEmployee);
router.patch("/:id/salary", employeeController.getEmployeeByIdParam, validateBody(updateSalarySchema), employeeController.updateEmployeeSalary);
router.patch("/:id/deactivate", employeeController.getEmployeeByIdParam, employeeController.deactivateEmployee);
router.delete("/:id", employeeController.getEmployeeByIdParam, employeeController.removeEmployee);

export default router;
