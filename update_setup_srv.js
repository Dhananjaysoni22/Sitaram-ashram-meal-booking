const fs = require('fs');
let s = fs.readFileSync('backend/src/services/setup.service.ts', 'utf8');

s = s.replace(
  `export const getWorkerCategoriesService = async () => getWorkerCategories();`,
  `export const getWorkerCategoriesService = async (type: string = "ASHRAM") => getWorkerCategories(type);`
);

s = s.replace(
  `export const createWorkerCategoryService = async (name: string) => createWorkerCategory(name);`,
  `export const createWorkerCategoryService = async (name: string, type: string = "ASHRAM") => createWorkerCategory(name, type);`
);

fs.writeFileSync('backend/src/services/setup.service.ts', s);
console.log("Updated setup.service.ts");
