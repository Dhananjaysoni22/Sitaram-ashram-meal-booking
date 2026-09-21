import { prisma } from "../config/db";

export const getAllWorkersInDb = async (limit?: number, skip?: number) => {
  return await prisma.worker.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' },
    take: limit,
    skip: skip
  });
};

export const countAllWorkersInDb = async () => {
  return await prisma.worker.count();
};

export const createWorkerInDb = async (data: any) => {
  return await prisma.worker.create({
    data
  });
};

export const updateWorkerInDb = async (id: string, data: any) => {
  return await prisma.worker.update({
    where: { id },
    data
  });
};
export const deleteWorkerInDb = async (id: string) => { return await prisma.worker.update({ where: { id }, data: { isDeleted: true } }); };
