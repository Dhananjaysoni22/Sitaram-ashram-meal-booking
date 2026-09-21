import axiosClient from "./axiosClient";

// Workers
export const getAllWorkers = () => axiosClient.get("/workers");
export const createWorker = (data: any) => axiosClient.post("/workers", data);
export const updateWorker = (id: string, data: any) => axiosClient.patch(`/workers/${id}`, data);
export const deleteWorker = (id: string) => axiosClient.delete(`/workers/${id}`);

// Attendance
export const getAttendance = (date: string) => axiosClient.get(`/workers/attendance?date=${date}`);
export const checkInWorker = (workerId: string, date: string) => axiosClient.post("/workers/attendance/check-in", { workerId, date });
export const checkOutWorker = (workerId: string, date: string) => axiosClient.post("/workers/attendance/check-out", { workerId, date });
export const markAbsent = (workerId: string, date: string) => axiosClient.post("/workers/attendance/absent", { workerId, date });

// Payments
export const getWorkerPayments = (workerId: string) => axiosClient.get(`/workers/payments/${workerId}`);
export const addPayment = (workerId: string, amount: number, paymentDate: string, notes?: string) => 
  axiosClient.post("/workers/payments", { workerId, amount, paymentDate, notes });

// Reports
export const getMonthlyReport = (year: number, month: number, page?: number, limit?: number) => {
  let url = `/workers/reports/monthly?year=${year}&month=${month}`;
  if (page) url += `&page=${page}`;
  if (limit) url += `&limit=${limit}`;
  return axiosClient.get(url);
};
