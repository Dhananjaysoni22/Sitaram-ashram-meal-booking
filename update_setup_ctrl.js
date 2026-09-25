const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/setup.controller.ts', 'utf8');

c = c.replace(
  `export const getWorkerCategories = asyncHandler(async (req: any, res: any) => {
  const data = await getWorkerCategoriesService();`,
  `export const getWorkerCategories = asyncHandler(async (req: any, res: any) => {
  const data = await getWorkerCategoriesService(req.query.type as string || "ASHRAM");`
);

c = c.replace(
  `export const createWorkerCategory = asyncHandler(async (req: any, res: any) => {
  const data = await createWorkerCategoryService(req.body.name);`,
  `export const createWorkerCategory = asyncHandler(async (req: any, res: any) => {
  const data = await createWorkerCategoryService(req.body.name, req.body.type || "ASHRAM");`
);

fs.writeFileSync('backend/src/controllers/setup.controller.ts', c);
console.log("Updated setup.controller.ts");
