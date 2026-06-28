import { Role } from "../types/enums";
import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

const readers = [Role.ADMIN, Role.HR_MANAGER] as const;

router.use(authenticate);
router.use(authorize(...readers));

router.get("/summary", analyticsController.summary);
router.get("/by-department", analyticsController.byDepartment);
router.get("/by-status", analyticsController.byStatus);
router.get("/pay-range", analyticsController.payRange);

export default router;
