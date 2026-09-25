import { prisma } from "../config/db";

export const getAllWorkersInDb = async (workerType: string = "ASHRAM", limit?: number, skip?: number) => {
  return await prisma.worker.findMany({
    where: { isDeleted: false, workerType },
    orderBy: { name: 'asc' },
    take: limit,
    skip: skip
  });
};

export const countAllWorkersInDb = async (workerType: string = "ASHRAM") => {
  return await prisma.worker.count({ where: { isDeleted: false, workerType } });
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
