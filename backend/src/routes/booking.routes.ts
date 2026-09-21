import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  getAllBookings,
  newBooking,
  updateStatus,
  updateBookingDetails,
  getReportBookings,
  swapBookings,
  deleteBooking
} from "../controllers/booking.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = express.Router();

// Apply auth middleware to all booking routes
router.use(protect);

router.route("/swap/:date/:baseMealType").post(swapBookings);
router.route("/report").get(getReportBookings);
router.route("/").get(getAllBookings).post(newBooking);
router.route("/:id").patch(updateBookingDetails).delete(restrictTo("SUPER_ADMIN"), deleteBooking);
router.route("/:id/status").patch(updateStatus);

export default router;
