import { Role } from "../types/enums";
import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";

import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.validator";

const router = Router();

router.use(authenticate);

router.get("/", authorize(Role.ADMIN), userController.listUsers);

router.get(
  "/:id",
  authorize(Role.ADMIN),
  userController.getUserByIdParam,
  userController.getUser,
);

router.post(
  "/",
  authorize(Role.ADMIN),
  validateBody(createUserSchema),
  userController.createUser,
);

router.put(
  "/:id",
  authorize(Role.ADMIN, Role.HR_MANAGER),
  userController.getUserByIdParam,
  validateBody(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  authorize(Role.ADMIN),
  userController.getUserByIdParam,
  userController.removeUser,
);

export default router;
