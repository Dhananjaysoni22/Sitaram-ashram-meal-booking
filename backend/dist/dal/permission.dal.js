"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPermissionsForRoleInDb = exports.getPermissionsForRoleInDb = exports.getAllPermissionsInDb = void 0;
const db_1 = require("../config/db");
const getAllPermissionsInDb = async () => {
    return await db_1.prisma.rolePermission.findMany();
};
exports.getAllPermissionsInDb = getAllPermissionsInDb;
const getPermissionsForRoleInDb = async (role) => {
    return await db_1.prisma.rolePermission.findMany({
        where: { role }
    });
};
exports.getPermissionsForRoleInDb = getPermissionsForRoleInDb;
const setPermissionsForRoleInDb = async (role, screens) => {
    return await db_1.prisma.$transaction(async (tx) => {
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
exports.setPermissionsForRoleInDb = setPermissionsForRoleInDb;
