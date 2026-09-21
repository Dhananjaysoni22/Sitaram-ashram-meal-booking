"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentInDb = exports.getPaymentsByMonthInDb = exports.getPaymentsByWorkerIdInDb = void 0;
const db_1 = require("../config/db");
const getPaymentsByWorkerIdInDb = async (workerId) => {
    return await db_1.prisma.payment.findMany({
        where: { workerId },
        orderBy: { paymentDate: 'desc' }
    });
};
exports.getPaymentsByWorkerIdInDb = getPaymentsByWorkerIdInDb;
const getPaymentsByMonthInDb = async (startDate, endDate) => {
    return await db_1.prisma.payment.findMany({
        where: {
            paymentDate: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            worker: true
        }
    });
};
exports.getPaymentsByMonthInDb = getPaymentsByMonthInDb;
const createPaymentInDb = async (data) => {
    return await db_1.prisma.payment.create({
        data
    });
};
exports.createPaymentInDb = createPaymentInDb;
