import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as workerService from "../services/worker.service";

// ---- Workers ----
export const getAllWorkers = asyncHandler(async (req: Request, res: Response) => {
  const workerType = req.query.workerType as string || "ASHRAM";
  const workers = await workerService.getAllWorkersService(workerType);
  res.json({ success: true, data: workers });
});

export const createWorker = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.createWorkerService(req.body);
  res.status(201).json({ success: true, data: worker });
});

export const updateWorker = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.updateWorkerService(req.params.id as string, req.body);
  res.json({ success: true, data: worker });
});

// ---- Attendance ----
export const getAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  const attendance = await workerService.getAttendanceService(date as string);
  res.json({ success: true, data: attendance });
});

export const checkInWorker = asyncHandler(async (req: Request, res: Response) => {
  const { workerId, date } = req.body;
  const attendance = await workerService.checkInWorkerService(workerId, date);
  res.json({ success: true, data: attendance });
});

export const checkOutWorker = asyncHandler(async (req: Request, res: Response) => {
  const { workerId, date } = req.body;
  const attendance = await workerService.checkOutWorkerService(workerId, date);
  res.json({ success: true, data: attendance });
});

export const markAbsent = asyncHandler(async (req: Request, res: Response) => {
  const { workerId, date } = req.body;
  const attendance = await workerService.markAbsentService(workerId, date);
  res.json({ success: true, data: attendance });
});

// ---- Payments ----
export const getWorkerPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await workerService.getWorkerPaymentsService(req.params.workerId as string);
  res.json({ success: true, data: payments });
});

export const addPayment = asyncHandler(async (req: Request, res: Response) => {
  const { workerId, amount, paymentDate, notes } = req.body;
  const payment = await workerService.addPaymentService(workerId, amount, paymentDate, notes);
  res.status(201).json({ success: true, data: payment });
});

// ---- Monthly Report ----
export const getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
  const { year, month, page, limit } = req.query; // 0-indexed month
  
  const limitNum = limit ? Number(limit) : undefined;
  const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

  const workerType = req.query.workerType as string || "ASHRAM";
  const result = await workerService.getMonthlyReportService(Number(year), Number(month), workerType, limitNum, skipNum);
  res.json({ success: true, data: result.data, total: result.total, page: Number(page) || 1, limit: limitNum });
});
export const deleteWorker = asyncHandler(async (req: Request, res: Response) => { const worker = await workerService.deleteWorkerService(req.params.id as string); res.json({ success: true, data: worker }); });

// ---- Single Worker History ----
export const getWorkerHistory = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = req.query; 
  const result = await workerService.getWorkerHistoryService(req.params.id as string, Number(year as any), Number(month as any));
  res.json({ success: true, data: result });
});
