const fs = require('fs');
let ws = fs.readFileSync('frontend/src/pages/Workers.tsx', 'utf8');
let mw = fs.readFileSync('frontend/src/pages/MandirWorkers.tsx', 'utf8');

// Update Workers.tsx
ws = ws.replace(
  `const res = await getAllWorkers();`,
  `const res = await getAllWorkers("ASHRAM");`
);
ws = ws.replace(
  `const catRes = await getWorkerCategories();`,
  `const catRes = await getWorkerCategories("ASHRAM");`
);
ws = ws.replace(
  `await createWorker({ ...formData, wageRate: Number(formData.wageRate) });`,
  `await createWorker({ ...formData, wageRate: Number(formData.wageRate), workerType: "ASHRAM" });`
);
ws = ws.replace(
  `export default function Workers() {`,
  `export default function Workers() { // Ashram Workers`
);
fs.writeFileSync('frontend/src/pages/Workers.tsx', ws);

// Update MandirWorkers.tsx
mw = mw.replace(
  `const res = await getAllWorkers();`,
  `const res = await getAllWorkers("MANDIR");`
);
mw = mw.replace(
  `const catRes = await getWorkerCategories();`,
  `const catRes = await getWorkerCategories("MANDIR");`
);
mw = mw.replace(
  `await createWorker({ ...formData, wageRate: Number(formData.wageRate) });`,
  `await createWorker({ ...formData, wageRate: Number(formData.wageRate), workerType: "MANDIR" });`
);
mw = mw.replace(
  `export default function Workers() {`,
  `export default function MandirWorkers() {`
);
mw = mw.replace(
  `WorkersManagement`,
  `MandirWorkersManagement`
);
mw = mw.replace(
  `WorkersManagementDesc`,
  `MandirWorkersManagementDesc` // Make sure to add these to translation files or fallback gracefully
);
fs.writeFileSync('frontend/src/pages/MandirWorkers.tsx', mw);

console.log("Updated both worker files");
