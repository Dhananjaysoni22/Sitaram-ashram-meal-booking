"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyReport = exports.addPayment = exports.getWorkerPayments = exports.markAbsent = exports.checkOutWorker = exports.checkInWorker = exports.getAttendance = exports.updateWorker = exports.createWorker = exports.getAllWorkers = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const workerService = __importStar(require("../services/worker.service"));
// ---- Workers ----
exports.getAllWorkers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workers = await workerService.getAllWorkersService();
    res.json({ success: true, data: workers });
});
exports.createWorker = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const worker = await workerService.createWorkerService(req.body);
    res.status(201).json({ success: true, data: worker });
});
exports.updateWorker = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const worker = await workerService.updateWorkerService(req.params.id, req.body);
    res.json({ success: true, data: worker });
});
// ---- Attendance ----
exports.getAttendance = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date } = req.query;
    const attendance = await workerService.getAttendanceService(date);
    res.json({ success: true, data: attendance });
});
exports.checkInWorker = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { workerId, date } = req.body;
    const attendance = await workerService.checkInWorkerService(workerId, date);
    res.json({ success: true, data: attendance });
});
exports.checkOutWorker = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { workerId, date } = req.body;
    const attendance = await workerService.checkOutWorkerService(workerId, date);
    res.json({ success: true, data: attendance });
});
exports.markAbsent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { workerId, date } = req.body;
    const attendance = await workerService.markAbsentService(workerId, date);
    res.json({ success: true, data: attendance });
});
// ---- Payments ----
exports.getWorkerPayments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const payments = await workerService.getWorkerPaymentsService(req.params.workerId);
    res.json({ success: true, data: payments });
});
exports.addPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { workerId, amount, paymentDate, notes } = req.body;
    const payment = await workerService.addPaymentService(workerId, amount, paymentDate, notes);
    res.status(201).json({ success: true, data: payment });
});
// ---- Monthly Report ----
exports.getMonthlyReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { year, month, page, limit } = req.query; // 0-indexed month
    const limitNum = limit ? Number(limit) : undefined;
    const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;
    const result = await workerService.getMonthlyReportService(Number(year), Number(month), limitNum, skipNum);
    res.json({ success: true, data: result.data, total: result.total, page: Number(page) || 1, limit: limitNum });
});
