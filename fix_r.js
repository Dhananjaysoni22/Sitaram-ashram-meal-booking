const fs = require('fs');

let r = fs.readFileSync('backend/src/routes/worker.routes.ts', 'utf8');

if (!r.includes('getWorkerHistory')) {
  r = r.replace(
    /getMonthlyReport\r?\n\} from "\.\.\/controllers\/worker\.controller";/,
    `getMonthlyReport,\n  getWorkerHistory\n} from "../controllers/worker.controller";`
  );
}

fs.writeFileSync('backend/src/routes/worker.routes.ts', r);
console.log("Fixed route import properly");
