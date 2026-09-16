import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware";
import {
  getOccasions,
  createOccasion,
  deleteOccasion,
  getWorkerCategories,
  createWorkerCategory,
  deleteWorkerCategory,
  getRoles,
  createRole,
  deleteRole
} from "../controllers/setup.controller";

const router = express.Router();

router.use(protect); // all routes need auth

// Occasions
router.route("/occasions")
  .get(getOccasions)
  .post(authorize("SUPER_ADMIN"), createOccasion); 
router.route("/occasions/:id")
  .delete(authorize("SUPER_ADMIN"), deleteOccasion);

// Worker Categories
router.route("/worker-categories")
  .get(getWorkerCategories)
  .post(authorize("SUPER_ADMIN"), createWorkerCategory);
router.route("/worker-categories/:id")
  .delete(authorize("SUPER_ADMIN"), deleteWorkerCategory);

// Roles
router.route("/roles")
  .get(getRoles)
  .post(authorize("SUPER_ADMIN"), createRole);
router.route("/roles/:id")
  .delete(authorize("SUPER_ADMIN"), deleteRole);

export default router;
