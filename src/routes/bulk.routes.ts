import { Role } from "../types/enums";
import { Router } from "express";
import * as bulkController from "../controllers/bulk.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { bulkAdjustmentSchema } from "../validators/bulk.validator";

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.post("/adjustment/preview", validateBody(bulkAdjustmentSchema), bulkController.previewAdjustment);
router.post("/adjustment/apply", validateBody(bulkAdjustmentSchema), bulkController.applyAdjustment);

export default router;
