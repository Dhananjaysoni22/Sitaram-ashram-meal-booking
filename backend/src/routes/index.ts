import express from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import bookingRoutes from "./booking.routes";
import workerRoutes from "./worker.routes";
import setupRoutes from "./setup.routes";
import permissionRoutes from "./permission.routes";
import calendarRoutes from "./calendar.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/workers", workerRoutes);
router.use("/setup", setupRoutes);
router.use("/permissions", permissionRoutes);
router.use("/calendar", calendarRoutes);

export default router;
