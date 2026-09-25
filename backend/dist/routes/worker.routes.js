"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const worker_controller_1 = require("../controllers/worker.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect); // Only staff/admin can access
// Worker routes
router.route("/")
    .get(worker_controller_1.getAllWorkers)
    .post(worker_controller_1.createWorker);
router.route("/:id")
    .patch(worker_controller_1.updateWorker)
    .delete(worker_controller_1.deleteWorker);
// Attendance routes
router.route("/attendance")
    .get(worker_controller_1.getAttendance);
router.route("/attendance/check-in")
    .post(worker_controller_1.checkInWorker);
router.route("/attendance/check-out")
    .post(worker_controller_1.checkOutWorker);
router.route("/attendance/absent")
    .post(worker_controller_1.markAbsent);
// Payment routes
router.route("/payments")
    .post(worker_controller_1.addPayment);
router.route("/payments/:workerId")
    .get(worker_controller_1.getWorkerPayments);
// Reports
router.route("/reports/monthly")
    .get(worker_controller_1.getMonthlyReport);
exports.default = router;
