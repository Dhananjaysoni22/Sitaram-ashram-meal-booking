"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFestivalsService = exports.deleteFestivalService = exports.createFestivalService = exports.getFestivalsForDateService = exports.getFestivalsForMonthService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFestivalsForMonthService = async (year, month) => {
    // Find festivals in the given year and month
    // Create start and end date for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const festivals = await prisma.festival.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            },
            isActive: true
        }
    });
    const grouped = {};
    for (const f of festivals) {
        const y = f.date.getFullYear();
        const m = String(f.date.getMonth() + 1).padStart(2, "0");
        const d = String(f.date.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        if (!grouped[dateStr])
            grouped[dateStr] = [];
        grouped[dateStr].push(f.name);
    }
    return grouped;
};
exports.getFestivalsForMonthService = getFestivalsForMonthService;
const getFestivalsForDateService = async (dateStr) => {
    const dateObj = new Date(dateStr);
    const festivals = await prisma.festival.findMany({
        where: {
            date: {
                gte: new Date(dateObj.setHours(0, 0, 0, 0)),
                lte: new Date(dateObj.setHours(23, 59, 59, 999))
            },
            isActive: true
        }
    });
    return festivals.map(f => f.name);
};
exports.getFestivalsForDateService = getFestivalsForDateService;
const createFestivalService = async (date, name) => {
    return await prisma.festival.create({
        data: { date, name }
    });
};
exports.createFestivalService = createFestivalService;
const deleteFestivalService = async (id) => {
    return await prisma.festival.update({
        where: { id },
        data: { isActive: false }
    });
};
exports.deleteFestivalService = deleteFestivalService;
const getAllFestivalsService = async () => {
    return await prisma.festival.findMany({
        where: { isActive: true },
        orderBy: { date: "asc" }
    });
};
exports.getAllFestivalsService = getAllFestivalsService;
