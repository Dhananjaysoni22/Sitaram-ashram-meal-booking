const fs = require('fs');
let r = fs.readFileSync('backend/src/routes/worker.routes.ts', 'utf8');
r = r.replace(
  'getMonthlyReport',
  'getMonthlyReport, getWorkerHistory'
);
fs.writeFileSync('backend/src/routes/worker.routes.ts', r);
