import { Router } from "express";
import authRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import userRoutes from "./user.routes";
import analyticsRoutes from "./analytics.routes";
import referenceRoutes from "./reference.routes";
import bulkRoutes from "./bulk.routes";
import auditRoutes from "./audit.routes";
import importRoutes, { exportRouter } from "./importExport.routes";
import payrollRoutes from "./payroll.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reference", referenceRoutes);
router.use("/bulk", bulkRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/import", importRoutes);
router.use("/export", exportRouter);
router.use("/payroll", payrollRoutes);

export default router;
