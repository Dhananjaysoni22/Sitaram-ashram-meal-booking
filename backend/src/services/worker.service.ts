import { getAllWorkersInDb, createWorkerInDb, updateWorkerInDb, deleteWorkerInDb, countAllWorkersInDb } from "../dal/worker.dal";
import { getAttendanceByDateInDb, getAttendanceByMonthInDb, upsertAttendanceInDb } from "../dal/attendance.dal";
import { getPaymentsByWorkerIdInDb, getPaymentsByMonthInDb, createPaymentInDb } from "../dal/payment.dal";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/db";

// ---- Workers ----
export const getAllWorkersService = async (workerType: string = "ASHRAM") => {
  return await getAllWorkersInDb(workerType);
};

export const createWorkerService = async (data: any) => {
  return await createWorkerInDb(data);
};

export const updateWorkerService = async (id: string, data: any) => {
  return await updateWorkerInDb(id, data);
};

// ---- Attendance ----
export const getAttendanceService = async (dateStr: string) => {
  const date = new Date(dateStr);
  return await getAttendanceByDateInDb(date);
};

export const checkInWorkerService = async (workerId: string, dateStr: string) => {
  const date = new Date(dateStr);
  return await upsertAttendanceInDb(workerId, date, {
    isPresent: true,
    entryTime: new Date()
  });
};

export const checkOutWorkerService = async (workerId: string, dateStr: string) => {
  const date = new Date(dateStr);
  const exitTime = new Date();
  
  // Need to get current attendance to calculate hours
  // Upsert handles it but we can't calculate inside upsert easily
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      workerId_date: {
        workerId,
        date: startOfDay
      }
    }
  });

  if (!attendance || !attendance.entryTime) {
    throw new AppError("Worker has not checked in yet.", 400);
  }

  const hours = (exitTime.getTime() - attendance.entryTime.getTime()) / (1000 * 60 * 60);

  return await upsertAttendanceInDb(workerId, date, {
    exitTime,
    totalHours: Number(hours.toFixed(2))
  });
};

export const markAbsentService = async (workerId: string, dateStr: string) => {
  const date = new Date(dateStr);
  return await upsertAttendanceInDb(workerId, date, {
    isPresent: false,
    entryTime: null,
    exitTime: null,
    totalHours: null
  });
};

// ---- Payments ----
export const getWorkerPaymentsService = async (workerId: string) => {
  return await getPaymentsByWorkerIdInDb(workerId);
};

export const addPaymentService = async (workerId: string, amount: number, paymentDateStr: string, notes?: string) => {
  return await createPaymentInDb({
    workerId,
    amount: Number(amount),
    paymentDate: new Date(paymentDateStr),
    notes
  });
};

// ---- Monthly Report ----
export const getMonthlyReportService = async (year: number, month: number, workerType: string = "ASHRAM", limit?: number, skip?: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const attendances = await getAttendanceByMonthInDb(startDate, endDate);
  const payments = await getPaymentsByMonthInDb(startDate, endDate);
  const workers = await getAllWorkersInDb(workerType, limit, skip);
  const totalCount = await countAllWorkersInDb(workerType);

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
export const deleteWorkerService = async (id: string) => { return await deleteWorkerInDb(id); };

// ---- Single Worker History ----
export const getWorkerHistoryService = async (workerId: string, year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const attendances = await prisma.attendance.findMany({
    where: {
      workerId,
      date: { gte: startDate, lte: endDate }
    },
    orderBy: { date: 'asc' }
  });

  const payments = await prisma.payment.findMany({
    where: {
      workerId,
      paymentDate: { gte: startDate, lte: endDate }
    },
    orderBy: { paymentDate: 'desc' }
  });

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });

  return { worker, attendances, payments };
};
