import { Router } from "express";
import { getAllUsers, updateUser, resetPin, createUser } from "../controllers/user.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Only SUPER_ADMIN can manage users
router.use(protect);
router.use(authorize("SUPER_ADMIN"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").patch(updateUser);
router.route("/:id/reset-pin").patch(resetPin);

export default router;
