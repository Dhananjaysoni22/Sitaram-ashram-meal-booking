"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookingService = exports.swapBookingsService = exports.getReportBookingsService = exports.updateBookingDetailsService = exports.updateBookingStatus = exports.newBooking = exports.getAllbookings = void 0;
const booking_dal_1 = require("../dal/booking.dal");
const AppError_1 = require("../utils/AppError");
const db_1 = require("../config/db");
const getAllbookings = async () => {
    return (0, booking_dal_1.getAllBookings)();
};
exports.getAllbookings = getAllbookings;
const newBooking = async (data, userId) => {
    const targetDate = new Date(data.date);
    const exisiting = await (0, booking_dal_1.findBookingByDateAndMeal)(targetDate, data.mealType);
    if (exisiting && exisiting.status !== "CANCELLED") {
        throw new AppError_1.AppError("Duplicate Booking", 400);
    }
    return await (0, booking_dal_1.newBooking)({ ...data, createdById: userId });
};
exports.newBooking = newBooking;
const updateBookingStatus = async (id, status) => {
    return await (0, booking_dal_1.updateBookingStatusInDb)(id, status);
};
exports.updateBookingStatus = updateBookingStatus;
const updateBookingDetailsService = async (id, updateData, userRole, userId) => {
    const currentBooking = await db_1.prisma.booking.findUnique({ where: { id } });
    if (!currentBooking)
        throw new AppError_1.AppError("Booking not found", 404);
    // Check advanceAmount security rule
    const incomingAdvance = updateData.advanceAmount !== undefined ?
        (updateData.advanceAmount ? Number(updateData.advanceAmount) : null)
        : undefined;
    if (currentBooking.advanceAmount && currentBooking.advanceAmount > 0) {
        if (incomingAdvance !== undefined && incomingAdvance !== currentBooking.advanceAmount) {
            if (userRole !== "SUPER_ADMIN") {
                throw new AppError_1.AppError("Only an Admin can modify the Advance Amount once it has been paid.", 403);
            }
        }
    }
    const checkDate = updateData.date ? new Date(updateData.date) : currentBooking.date;
    const checkMeal = updateData.mealType || currentBooking.mealType;
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    // Check for collisions if date or mealType is changing
    if (updateData.date || updateData.mealType) {
        const existing = await db_1.prisma.booking.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                mealType: checkMeal,
                status: { not: "CANCELLED" },
                id: { not: id }
            }
        });
        if (existing) {
            throw new AppError_1.AppError("This date and meal slot is already booked by someone else.", 400);
        }
    }
    // Ensure total is recalculated
    const monks = updateData.monksCount !== undefined ? Number(updateData.monksCount) : currentBooking.monksCount;
    const guests = updateData.guestsCount !== undefined ? Number(updateData.guestsCount) : currentBooking.guestsCount;
    const finalData = {
        ...updateData,
        updatedById: userId,
        date: updateData.date ? new Date(updateData.date) : undefined,
        monksCount: monks,
        guestsCount: guests,
        totalCount: monks + guests,
        advanceAmount: updateData.advanceAmount !== undefined ? (updateData.advanceAmount ? Number(updateData.advanceAmount) : null) : undefined,
        costPerHead: updateData.costPerHead !== undefined ? (updateData.costPerHead ? Number(updateData.costPerHead) : null) : undefined,
        valetParking: updateData.valetParking !== undefined ? Number(updateData.valetParking) : undefined,
        waiters: updateData.waiters !== undefined ? Number(updateData.waiters) : undefined,
        coolers: updateData.coolers !== undefined ? Number(updateData.coolers) : undefined,
        guards: updateData.guards !== undefined ? Number(updateData.guards) : undefined,
        masalchis: updateData.masalchis !== undefined ? Number(updateData.masalchis) : undefined,
        totalPayment: updateData.totalPayment !== undefined ? (updateData.totalPayment ? Number(updateData.totalPayment) : null) : undefined,
    };
    return await db_1.prisma.booking.update({
        where: { id },
        data: finalData,
    });
};
exports.updateBookingDetailsService = updateBookingDetailsService;
const getReportBookingsService = async (startDateStr, endDateStr, search, limit, skip) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    const { data, total, statsData } = await (0, booking_dal_1.getReportBookingsInDb)(startDate, endDate, search, skip, limit);
    const stats = {
        totalBookings: statsData.filter((b) => b.status !== "CANCELLED").length,
        completed: statsData.filter((b) => b.status === "COMPLETED").length,
        cancelled: statsData.filter((b) => b.status === "CANCELLED").length,
        totalMonks: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.monksCount || 0), 0),
        totalGuests: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.guestsCount || 0), 0),
        totalWaiters: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.waiters || 0), 0),
        totalValet: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.valetParking || 0), 0),
        totalCoolers: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.coolers || 0), 0),
        totalGuards: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.guards || 0), 0),
        totalMasalchis: statsData.filter((b) => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.masalchis || 0), 0),
    };
    return { data, total, stats };
};
exports.getReportBookingsService = getReportBookingsService;
const swapBookingsService = async (dateStr, baseMealType, userId) => {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const floorMeal = baseMealType + "_FIRST_FLOOR";
    const groundBooking = await db_1.prisma.booking.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay }, mealType: baseMealType, status: { not: "CANCELLED" } } });
    const firstFloorBooking = await db_1.prisma.booking.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay }, mealType: floorMeal, status: { not: "CANCELLED" } } });
    if (!groundBooking || !firstFloorBooking)
        throw new AppError_1.AppError("Both Ground and First Floor must be booked to swap them.", 400);
    await db_1.prisma.$transaction([
        db_1.prisma.booking.update({ where: { id: groundBooking.id }, data: { mealType: floorMeal, updatedById: userId } }),
        db_1.prisma.booking.update({ where: { id: firstFloorBooking.id }, data: { mealType: baseMealType, updatedById: userId } })
    ]);
};
exports.swapBookingsService = swapBookingsService;
const deleteBookingService = async (id) => {
    const { deleteBookingInDb } = require("../dal/booking.dal");
    return await deleteBookingInDb(id);
};
exports.deleteBookingService = deleteBookingService;
