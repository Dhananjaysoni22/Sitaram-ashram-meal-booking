"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertAttendanceInDb = exports.getAttendanceByMonthInDb = exports.getAttendanceByDateInDb = void 0;
const db_1 = require("../config/db");
const getAttendanceByDateInDb = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return await db_1.prisma.attendance.findMany({
        where: {
            date: {
                gte: startOfDay,
                lt: endOfDay
            }
        },
        include: {
            worker: true
        }
    });
};
exports.getAttendanceByDateInDb = getAttendanceByDateInDb;
const getAttendanceByMonthInDb = async (startDate, endDate) => {
    return await db_1.prisma.attendance.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            worker: true
        }
    });
};
exports.getAttendanceByMonthInDb = getAttendanceByMonthInDb;
const upsertAttendanceInDb = async (workerId, date, data) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return await db_1.prisma.attendance.upsert({
        where: {
            workerId_date: {
                workerId,
                date: startOfDay
            }
        },
        update: data,
        create: {
            workerId,
            date: startOfDay,
            ...data
        }
    });
};
exports.upsertAttendanceInDb = upsertAttendanceInDb;
