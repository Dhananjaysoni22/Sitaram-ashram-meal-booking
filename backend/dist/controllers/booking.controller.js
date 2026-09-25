"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.swapBookings = exports.updateBookingDetails = exports.updateStatus = exports.newBooking = exports.getReportBookings = exports.getAllBookings = void 0;
const booking_service_1 = require("../services/booking.service");
const AppError_1 = require("../utils/AppError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getAllBookings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bookings = await (0, booking_service_1.getAllbookings)();
    res.json(bookings);
});
exports.getReportBookings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, search, page, limit } = req.query;
    const limitNum = limit ? Number(limit) : undefined;
    const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;
    const result = await (0, booking_service_1.getReportBookingsService)(startDate, endDate, search || "", limitNum, skipNum);
    res.json({
        success: true,
        data: result.data,
        total: result.total,
        stats: result.stats,
        page: Number(page) || 1,
        limit: limitNum
    });
});
exports.newBooking = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, mealType, sponsorName, mobileNumber } = req.body;
    const userId = req.user?.id;
    if (!date || !mealType || !sponsorName || !mobileNumber) {
        throw new AppError_1.AppError("Please provide date, mealType, sponsorName, and mobileNumber", 400);
    }
    const booking = await (0, booking_service_1.newBooking)(req.body, userId);
    res.status(201).json({
        success: true,
        data: booking,
    });
});
exports.updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const status = req.body.status;
    const updateBooking = await (0, booking_service_1.updateBookingStatus)(id, status);
    res.status(200).json({
        success: true,
        data: updateBooking,
    });
});
exports.updateBookingDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const userRole = req.user?.role || "COORDINATOR"; // default just in case
    const userId = req.user?.id;
    const updated = await (0, booking_service_1.updateBookingDetailsService)(id, req.body, userRole, userId);
    res.status(200).json({
        success: true,
        data: updated,
    });
});
exports.swapBookings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (user.role !== "SUPER_ADMIN") {
        throw new AppError_1.AppError("Only an Admin can swap bookings.", 403);
    }
    const { date, baseMealType } = req.params;
    await (0, booking_service_1.swapBookingsService)(date, baseMealType, user.id);
    res.json({ success: true, message: "Bookings swapped successfully" });
});
exports.deleteBooking = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { deleteBookingService } = require("../services/booking.service");
    await deleteBookingService(req.params.id);
    res.status(204).json({ status: "success", data: null });
});
