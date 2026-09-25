const fs = require('fs');
let s = fs.readFileSync('backend/src/services/worker.service.ts', 'utf8');

s = s.replace(
  `export const getAllWorkersService = async () => {
  return await getAllWorkersInDb();`,
  `export const getAllWorkersService = async (workerType: string = "ASHRAM") => {
  return await getAllWorkersInDb(workerType);`
);

s = s.replace(
  `export const getMonthlyReportService = async (year: number, month: number, limit?: number, skip?: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const attendances = await getAttendanceByMonthInDb(startDate, endDate);
  const payments = await getPaymentsByMonthInDb(startDate, endDate);
  const workers = await getAllWorkersInDb(limit, skip);
  const totalCount = await countAllWorkersInDb();`,
  `export const getMonthlyReportService = async (year: number, month: number, workerType: string = "ASHRAM", limit?: number, skip?: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const attendances = await getAttendanceByMonthInDb(startDate, endDate);
  const payments = await getPaymentsByMonthInDb(startDate, endDate);
  const workers = await getAllWorkersInDb(workerType, limit, skip);
  const totalCount = await countAllWorkersInDb(workerType);`
);

fs.writeFileSync('backend/src/services/worker.service.ts', s);
console.log("Updated worker.service.ts");
