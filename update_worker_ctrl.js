const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/worker.controller.ts', 'utf8');

c = c.replace(
  `export const getAllWorkers = asyncHandler(async (req: Request, res: Response) => {
  const workers = await workerService.getAllWorkersService();`,
  `export const getAllWorkers = asyncHandler(async (req: Request, res: Response) => {
  const workerType = req.query.workerType as string || "ASHRAM";
  const workers = await workerService.getAllWorkersService(workerType);`
);

c = c.replace(
  `export const getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
  const { year, month, page, limit } = req.query; // 0-indexed month
  
  const limitNum = limit ? Number(limit) : undefined;
  const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

  const result = await workerService.getMonthlyReportService(Number(year), Number(month), limitNum, skipNum);`,
  `export const getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
  const { year, month, workerType, page, limit } = req.query; // 0-indexed month
  
  const limitNum = limit ? Number(limit) : undefined;
  const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

  const result = await workerService.getMonthlyReportService(Number(year), Number(month), workerType as string || "ASHRAM", limitNum, skipNum);`
);

fs.writeFileSync('backend/src/controllers/worker.controller.ts', c);
console.log("Updated worker.controller.ts");
