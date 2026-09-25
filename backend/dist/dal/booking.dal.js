"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookingInDb = exports.getReportBookingsInDb = exports.updateBookingStatusInDb = exports.newBooking = exports.findBookingByDateAndMeal = exports.getAllBookings = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const getAllBookings = async () => {
    return db_1.prisma.booking.findMany({
        where: { isDeleted: false },
        orderBy: { date: "asc" },
        include: {
            createdByUser: { select: { name: true } },
            updatedByUser: { select: { name: true } },
        }
    });
};
exports.getAllBookings = getAllBookings;
const findBookingByDateAndMeal = async (date, mealType) => {
    return await db_1.prisma.booking.findFirst({
        where: {
            // 2. Change how we search
            date: date,
            mealType: mealType,
        },
        // 3. Sort so we grab the newest attempt first!
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findBookingByDateAndMeal = findBookingByDateAndMeal;
const newBooking = async (payload) => {
    const bookingData = {
        date: new Date(payload.date),
        mealType: payload.mealType,
        status: payload.status || "BOOKED",
        sponsorName: payload.sponsorName,
        monksCount: Number(payload.monksCount) || 0,
        guestsCount: Number(payload.guestsCount) || 0,
        totalCount: Number(payload.totalCount) || 0,
        specialInstructions: payload.specialInstructions,
        coSponsors: payload.coSponsors || [],
        occasion: payload.occasion,
        mobileNumber: payload.mobileNumber,
        cityLocation: payload.cityLocation,
        advanceAmount: payload.advanceAmount ? Number(payload.advanceAmount) : null,
        costPerHead: payload.costPerHead ? Number(payload.costPerHead) : null,
        valetParking: payload.valetParking ? Number(payload.valetParking) : 0,
        waiters: payload.waiters ? Number(payload.waiters) : 0,
        coolers: payload.coolers ? Number(payload.coolers) : 0,
        guards: payload.guards ? Number(payload.guards) : 0,
        masalchis: payload.masalchis ? Number(payload.masalchis) : 0,
        totalPayment: payload.totalPayment ? Number(payload.totalPayment) : null,
        createdByUser: payload.createdById ? { connect: { id: payload.createdById } } : undefined,
        paymentMethod: payload.paymentMethod,
    };
    return await db_1.prisma.booking.create({
        data: bookingData,
    });
};
exports.newBooking = newBooking;
const updateBookingStatusInDb = async (id, status) => {
    const updateData = {
        status: status,
    };
    if (status === client_1.BookingStatus.COMPLETED) {
        updateData.completedAt = new Date();
    }
    return await db_1.prisma.booking.update({
        where: {
            id: id,
        },
        data: updateData,
    });
};
exports.updateBookingStatusInDb = updateBookingStatusInDb;
const getReportBookingsInDb = async (startDate, endDate, search, statusFilter, sortField = 'date', sortOrder = 'asc', skip, take) => {
    const baseWhere = {
        isDeleted: false,
        date: {
            gte: startDate,
            lte: endDate
        }
    };
    if (search) {
        const s = search.trim();
        const searchNum = Number(s);
        baseWhere.OR = [
            { sponsorName: { contains: s, mode: 'insensitive' } },
            { mobileNumber: { contains: s } },
            { cityLocation: { contains: s, mode: 'insensitive' } },
            { occasion: { contains: s, mode: 'insensitive' } },
            { alternateNumber: { contains: s } }
        ];
        if (!isNaN(searchNum) && s !== '') {
            baseWhere.OR.push({ totalCount: searchNum });
        }
    }
    const tableWhere = { ...baseWhere };
    if (statusFilter) {
        tableWhere.status = statusFilter;
    }
    const orderByObj = {};
    if (sortField) {
        orderByObj[sortField] = sortOrder;
    }
    else {
        orderByObj.date = 'asc';
    }
    const [data, total, statsData] = await Promise.all([
        db_1.prisma.booking.findMany({
            where: tableWhere,
            orderBy: orderByObj,
            skip,
            take
        }),
        db_1.prisma.booking.count({ where: tableWhere }),
        db_1.prisma.booking.findMany({ where: baseWhere })
    ]);
    return { data, total, statsData };
};
exports.getReportBookingsInDb = getReportBookingsInDb;
const deleteBookingInDb = async (id) => {
    return await db_1.prisma.booking.update({
        where: { id },
        data: { isDeleted: true }
    });
};
exports.deleteBookingInDb = deleteBookingInDb;
