const fs = require('fs');
let s = fs.readFileSync('backend/src/dal/worker.dal.ts', 'utf8');

s = s.replace(
  `export const getAllWorkersInDb = async (limit?: number, skip?: number) => {
  return await prisma.worker.findMany({
    where: { isDeleted: false },`,
  `export const getAllWorkersInDb = async (workerType: string = "ASHRAM", limit?: number, skip?: number) => {
  return await prisma.worker.findMany({
    where: { isDeleted: false, workerType },`
);

s = s.replace(
  `export const countAllWorkersInDb = async () => {
  return await prisma.worker.count();`,
  `export const countAllWorkersInDb = async (workerType: string = "ASHRAM") => {
  return await prisma.worker.count({ where: { isDeleted: false, workerType } });`
);

fs.writeFileSync('backend/src/dal/worker.dal.ts', s);
console.log("Updated worker.dal.ts");
