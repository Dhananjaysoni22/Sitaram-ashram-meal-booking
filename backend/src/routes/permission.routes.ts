import { Router } from "express";
import {
  getAllPermissions,
  getMyPermissions,
  updateRolePermissions
} from "../controllers/permission.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Everyone logged in can fetch their own permissions
router.get("/my", protect, getMyPermissions);

// Only Super Admin can view all and update
router.get("/", protect, authorize("SUPER_ADMIN"), getAllPermissions);
router.post("/", protect, authorize("SUPER_ADMIN"), updateRolePermissions);

export default router;
