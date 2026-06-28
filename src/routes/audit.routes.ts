import { Role } from "../types/enums";
import { Router } from "express";
import * as auditController from "../controllers/audit.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get("/", auditController.listAuditLogs);

export default router;
