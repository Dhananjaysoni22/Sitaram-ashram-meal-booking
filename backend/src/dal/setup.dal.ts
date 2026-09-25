import { prisma } from "../config/db";

export const getOccasions = async () => {
  return await prisma.setupOccasion.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
};

export const createOccasion = async (name: string) => {
  return await prisma.setupOccasion.create({ data: { name } });
};

export const deleteOccasion = async (id: string) => {
  return await prisma.setupOccasion.update({
    where: { id },
    data: { isActive: false }
  });
};

export const getWorkerCategories = async (type: string = "ASHRAM") => {
  return await prisma.setupWorkerCategory.findMany({
    where: { isActive: true, type },
    orderBy: { name: "asc" }
  });
};

export const createWorkerCategory = async (name: string, type: string = "ASHRAM") => {
  return await prisma.setupWorkerCategory.create({ data: { name, type } });
};

export const deleteWorkerCategory = async (id: string) => {
  return await prisma.setupWorkerCategory.update({
    where: { id },
    data: { isActive: false }
  });
};

export const getRoles = async () => {
  return await prisma.setupRole.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
};

export const createRole = async (name: string) => {
  return await prisma.setupRole.create({ data: { name } });
};

export const deleteRole = async (id: string) => {
  return await prisma.setupRole.update({
    where: { id },
    data: { isActive: false }
  });
};
