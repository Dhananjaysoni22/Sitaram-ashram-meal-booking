const fs = require('fs');

// 1. UPDATE ROUTES
let r = fs.readFileSync('backend/src/routes/worker.routes.ts', 'utf8');
r = r.replace(
  /export default router;/,
  `router.route("/history/:id").get(getWorkerHistory);\n\nexport default router;`
);
r = r.replace(
  /getMonthlyReport\n\} from "\.\.\/controllers\/worker\.controller";/,
  `getMonthlyReport,\n  getWorkerHistory\n} from "../controllers/worker.controller";`
);
fs.writeFileSync('backend/src/routes/worker.routes.ts', r);

// 2. UPDATE CONTROLLER
let c = fs.readFileSync('backend/src/controllers/worker.controller.ts', 'utf8');
c = c + `\n// ---- Single Worker History ----
export const getWorkerHistory = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = req.query; 
  const result = await workerService.getWorkerHistoryService(req.params.id, Number(year), Number(month));
  res.json({ success: true, data: result });
});\n`;
fs.writeFileSync('backend/src/controllers/worker.controller.ts', c);

// 3. UPDATE SERVICE
let s = fs.readFileSync('backend/src/services/worker.service.ts', 'utf8');
s = s + `\n// ---- Single Worker History ----
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
};\n`;
// Also need to import prisma in service if it isn't imported, but wait, I can just write the logic.
// Ah, prisma is probably not imported in worker.service.ts directly. Let's check!
