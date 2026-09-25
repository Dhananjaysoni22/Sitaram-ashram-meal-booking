"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerHistoryService = exports.deleteWorkerService = exports.getMonthlyReportService = exports.addPaymentService = exports.getWorkerPaymentsService = exports.markAbsentService = exports.checkOutWorkerService = exports.checkInWorkerService = exports.getAttendanceService = exports.updateWorkerService = exports.createWorkerService = exports.getAllWorkersService = void 0;
const worker_dal_1 = require("../dal/worker.dal");
const attendance_dal_1 = require("../dal/attendance.dal");
const payment_dal_1 = require("../dal/payment.dal");
const AppError_1 = require("../utils/AppError");
const db_1 = require("../config/db");
// ---- Workers ----
const getAllWorkersService = async (workerType = "ASHRAM") => {
    return await (0, worker_dal_1.getAllWorkersInDb)(workerType);
};
exports.getAllWorkersService = getAllWorkersService;
const createWorkerService = async (data) => {
    return await (0, worker_dal_1.createWorkerInDb)(data);
};
exports.createWorkerService = createWorkerService;
const updateWorkerService = async (id, data) => {
    return await (0, worker_dal_1.updateWorkerInDb)(id, data);
};
exports.updateWorkerService = updateWorkerService;
// ---- Attendance ----
const getAttendanceService = async (dateStr) => {
    const date = new Date(dateStr);
    return await (0, attendance_dal_1.getAttendanceByDateInDb)(date);
};
exports.getAttendanceService = getAttendanceService;
const checkInWorkerService = async (workerId, dateStr) => {
    const date = new Date(dateStr);
    return await (0, attendance_dal_1.upsertAttendanceInDb)(workerId, date, {
        isPresent: true,
        entryTime: new Date()
    });
};
exports.checkInWorkerService = checkInWorkerService;
const checkOutWorkerService = async (workerId, dateStr) => {
    const date = new Date(dateStr);
    const exitTime = new Date();
    // Need to get current attendance to calculate hours
    // Upsert handles it but we can't calculate inside upsert easily
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const attendance = await db_1.prisma.attendance.findUnique({
        where: {
            workerId_date: {
                workerId,
                date: startOfDay
            }
        }
    });
    if (!attendance || !attendance.entryTime) {
        throw new AppError_1.AppError("Worker has not checked in yet.", 400);
    }
    const hours = (exitTime.getTime() - attendance.entryTime.getTime()) / (1000 * 60 * 60);
    return await (0, attendance_dal_1.upsertAttendanceInDb)(workerId, date, {
        exitTime,
        totalHours: Number(hours.toFixed(2))
    });
};
exports.checkOutWorkerService = checkOutWorkerService;
const markAbsentService = async (workerId, dateStr) => {
    const date = new Date(dateStr);
    return await (0, attendance_dal_1.upsertAttendanceInDb)(workerId, date, {
        isPresent: false,
        entryTime: null,
        exitTime: null,
        totalHours: null
    });
};
exports.markAbsentService = markAbsentService;
// ---- Payments ----
const getWorkerPaymentsService = async (workerId) => {
    return await (0, payment_dal_1.getPaymentsByWorkerIdInDb)(workerId);
};
exports.getWorkerPaymentsService = getWorkerPaymentsService;
const addPaymentService = async (workerId, amount, paymentDateStr, notes) => {
    return await (0, payment_dal_1.createPaymentInDb)({
        workerId,
        amount: Number(amount),
        paymentDate: new Date(paymentDateStr),
        notes
    });
};
exports.addPaymentService = addPaymentService;
// ---- Monthly Report ----
const getMonthlyReportService = async (year, month, workerType = "ASHRAM", limit, skip) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const attendances = await (0, attendance_dal_1.getAttendanceByMonthInDb)(startDate, endDate);
    const payments = await (0, payment_dal_1.getPaymentsByMonthInDb)(startDate, endDate);
    const workers = await (0, worker_dal_1.getAllWorkersInDb)(workerType, limit, skip);
    const totalCount = await (0, worker_dal_1.countAllWorkersInDb)(workerType);
    // Aggregate
    const report = workers.map(w => {
        const wAtt = attendances.filter(a => a.workerId === w.id && a.isPresent);
        const wPay = payments.filter(p => p.workerId === w.id);
        const daysPresent = wAtt.length;
        const totalHours = wAtt.reduce((sum, a) => sum + (a.totalHours || 0), 0);
        const totalPaid = wPay.reduce((sum, p) => sum + p.amount, 0);
        return {
            worker: w,
            daysPresent,
            totalHours: Number(totalHours.toFixed(2)),
            totalPaid,
            payments: wPay
        };
    });
    return { data: report, total: totalCount };
};
exports.getMonthlyReportService = getMonthlyReportService;
const deleteWorkerService = async (id) => { return await (0, worker_dal_1.deleteWorkerInDb)(id); };
exports.deleteWorkerService = deleteWorkerService;
// ---- Single Worker History ----
const getWorkerHistoryService = async (workerId, year, month) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const attendances = await db_1.prisma.attendance.findMany({
        where: {
            workerId,
            date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'asc' }
    });
    const payments = await db_1.prisma.payment.findMany({
        where: {
            workerId,
            paymentDate: { gte: startDate, lte: endDate }
        },
        orderBy: { paymentDate: 'desc' }
    });
    const worker = await db_1.prisma.worker.findUnique({ where: { id: workerId } });
    return { worker, attendances, payments };
};
exports.getWorkerHistoryService = getWorkerHistoryService;
