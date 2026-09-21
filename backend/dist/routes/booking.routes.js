"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Apply auth middleware to all booking routes
router.use(auth_middleware_1.protect);
router.route("/swap/:date/:baseMealType").post(booking_controller_1.swapBookings);
router.route("/report").get(booking_controller_1.getReportBookings);
router.route("/").get(booking_controller_1.getAllBookings).post(booking_controller_1.newBooking);
router.route("/:id").patch(booking_controller_1.updateBookingDetails);
router.route("/:id/status").patch(booking_controller_1.updateStatus);
exports.default = router;
