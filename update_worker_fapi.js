const fs = require('fs');
let s = fs.readFileSync('frontend/src/api/worker.api.ts', 'utf8');

s = s.replace(
  `export const getAllWorkers = () => axiosClient.get("/workers");`,
  `export const getAllWorkers = (workerType: string = "ASHRAM") => axiosClient.get(\`/workers?workerType=\${workerType}\`);`
);

s = s.replace(
  `export const getMonthlyReport = (year: number, month: number, page?: number, limit?: number) => {
  let url = \`/workers/reports/monthly?year=\${year}&month=\${month}\`;`,
  `export const getMonthlyReport = (year: number, month: number, workerType: string = "ASHRAM", page?: number, limit?: number) => {
  let url = \`/workers/reports/monthly?year=\${year}&month=\${month}&workerType=\${workerType}\`;`
);

fs.writeFileSync('frontend/src/api/worker.api.ts', s);
console.log("Updated worker.api.ts");
