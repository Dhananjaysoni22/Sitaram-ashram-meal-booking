const fs = require('fs');
let s = fs.readFileSync('backend/src/dal/setup.dal.ts', 'utf8');

s = s.replace(
  `export const getWorkerCategories = async () => {
  return await prisma.setupWorkerCategory.findMany({
    where: { isActive: true },`,
  `export const getWorkerCategories = async (type: string = "ASHRAM") => {
  return await prisma.setupWorkerCategory.findMany({
    where: { isActive: true, type },`
);

s = s.replace(
  `export const createWorkerCategory = async (name: string) => {
  return await prisma.setupWorkerCategory.create({ data: { name } });
};`,
  `export const createWorkerCategory = async (name: string, type: string = "ASHRAM") => {
  return await prisma.setupWorkerCategory.create({ data: { name, type } });
};`
);

fs.writeFileSync('backend/src/dal/setup.dal.ts', s);
console.log("Updated setup.dal.ts");
