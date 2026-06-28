import { Role } from "@prisma/client";
import { Router } from "express";
import * as employeeController from "../controllers/employee.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.validator";

const router = Router();

const managers = [Role.ADMIN, Role.HR_MANAGER] as const;

router.use(authenticate);
router.use(authorize(...managers));

router.get("/", employeeController.listEmployees);
router.get("/:id", employeeController.getEmployeeByIdParam, employeeController.getEmployee);
router.post("/", validateBody(createEmployeeSchema), employeeController.createEmployee);
router.put("/:id", employeeController.getEmployeeByIdParam, validateBody(updateEmployeeSchema), employeeController.updateEmployee);
router.delete("/:id", employeeController.getEmployeeByIdParam, employeeController.removeEmployee);

export default router;
