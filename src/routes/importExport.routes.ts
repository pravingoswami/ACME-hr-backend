import { Role } from "../types/enums";
import { Router } from "express";
import * as importExportController from "../controllers/importExport.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { csvUpload, handleUploadError } from "../middleware/upload";
import { exportRequestSchema } from "../validators/bulk.validator";

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.post(
  "/upload",
  csvUpload,
  handleUploadError,
  importExportController.uploadImport,
);

router.post("/:jobId/process", importExportController.processImport);
router.get("/:jobId/status", importExportController.getImportStatus);

const exportRouter = Router();
exportRouter.use(authenticate);
exportRouter.use(authorize(Role.ADMIN));
exportRouter.post("/", validateBody(exportRequestSchema), importExportController.createExport);
exportRouter.get("/:jobId/download", importExportController.downloadExport);

export { exportRouter };
export default router;
