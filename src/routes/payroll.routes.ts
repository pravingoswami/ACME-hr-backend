import { Router } from "express";
import { downloadBulkSalarySlips } from "../controllers/salarySlip.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { Role } from "../types/enums";
import { bulkSalarySlipSchema } from "../validators/salarySlip.validator";

const router = Router();

const managers = [Role.ADMIN, Role.HR_MANAGER] as const;

router.use(authenticate);
router.use(authorize(...managers));

router.post(
  "/salary-slips/bulk",
  validateBody(bulkSalarySlipSchema),
  downloadBulkSalarySlips,
);

export default router;
