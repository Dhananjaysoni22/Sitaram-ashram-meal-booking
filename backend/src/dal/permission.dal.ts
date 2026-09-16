import { prisma } from "../config/db";

export const getAllPermissionsInDb = async () => {
  return await prisma.rolePermission.findMany();
};

export const getPermissionsForRoleInDb = async (role: string) => {
  return await prisma.rolePermission.findMany({
    where: { role }
  });
};

export const setPermissionsForRoleInDb = async (role: string, screens: string[]) => {
  return await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: { role }
    });

    if (screens.length > 0) {
      await tx.rolePermission.createMany({
        data: screens.map(screen => ({
          role,
          screen
        }))
      });
    }

    return await tx.rolePermission.findMany({
      where: { role }
    });
  });
};
