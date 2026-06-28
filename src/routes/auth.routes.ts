import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", validateBody(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);

export default router;
