import { Role } from "../types/enums";
import { Router } from "express";
import * as referenceController from "../controllers/reference.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

const readers = [Role.ADMIN, Role.HR_MANAGER] as const;

router.use(authenticate);
router.use(authorize(...readers));

router.get("/countries", referenceController.listCountries);
router.get("/departments", referenceController.listDepartments);
router.get("/job-grades", referenceController.listJobGrades);

export default router;
