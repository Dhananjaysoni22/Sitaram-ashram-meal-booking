const fs = require('fs');

let r = fs.readFileSync('backend/src/routes/worker.routes.ts', 'utf8');

if (!r.includes('getWorkerHistory')) {
  r = r.replace(
    /getMonthlyReport\n\} from "\.\.\/controllers\/worker\.controller";/,
    `getMonthlyReport,\n  getWorkerHistory\n} from "../controllers/worker.controller";`
  );
  if (!r.includes('getWorkerHistory')) {
     // fallback replace
     r = r.replace(`getMonthlyReport`, `getMonthlyReport,\n  getWorkerHistory`);
  }
}

fs.writeFileSync('backend/src/routes/worker.routes.ts', r);
console.log("Fixed route import");
