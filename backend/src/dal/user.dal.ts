import { prisma } from "../config/db";

export const findUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
};

export const updateUserInDb = async (id: string, data: any) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true
    }
  });
};
