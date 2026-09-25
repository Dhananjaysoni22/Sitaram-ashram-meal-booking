const fs = require('fs');
let s = fs.readFileSync('frontend/src/api/setup.api.ts', 'utf8');

s = s.replace(
  `export const getWorkerCategories = () => axiosClient.get("/setup/worker-categories");`,
  `export const getWorkerCategories = (type: string = "ASHRAM") => axiosClient.get(\`/setup/worker-categories?type=\${type}\`);`
);

s = s.replace(
  `export const createWorkerCategory = (name: string) => axiosClient.post("/setup/worker-categories", { name });`,
  `export const createWorkerCategory = (name: string, type: string = "ASHRAM") => axiosClient.post("/setup/worker-categories", { name, type });`
);

fs.writeFileSync('frontend/src/api/setup.api.ts', s);
console.log("Updated setup.api.ts");
