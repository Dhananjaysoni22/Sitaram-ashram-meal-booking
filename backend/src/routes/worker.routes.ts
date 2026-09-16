import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getAllWorkers,
  createWorker,
  updateWorker,
  getAttendance,
  checkInWorker,
  checkOutWorker,
  markAbsent,
  getWorkerPayments,
  addPayment,
  getMonthlyReport
} from "../controllers/worker.controller";

const router = express.Router();

router.use(protect); // Only staff/admin can access

// Worker routes
router.route("/")
  .get(getAllWorkers)
  .post(createWorker);

router.route("/:id")
  .patch(updateWorker);

// Attendance routes
router.route("/attendance")
  .get(getAttendance);
router.route("/attendance/check-in")
  .post(checkInWorker);
router.route("/attendance/check-out")
  .post(checkOutWorker);
router.route("/attendance/absent")
  .post(markAbsent);

// Payment routes
router.route("/payments")
  .post(addPayment);
router.route("/payments/:workerId")
  .get(getWorkerPayments);

// Reports
router.route("/reports/monthly")
  .get(getMonthlyReport);

export default router;
