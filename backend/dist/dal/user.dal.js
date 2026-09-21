"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserInDb = exports.getAllUsers = exports.findUserById = exports.findUserByUsername = void 0;
const db_1 = require("../config/db");
const findUserByUsername = async (username) => {
    return await db_1.prisma.user.findUnique({
        where: { username },
    });
};
exports.findUserByUsername = findUserByUsername;
const findUserById = async (id) => {
    return await db_1.prisma.user.findUnique({
        where: { id },
    });
};
exports.findUserById = findUserById;
const getAllUsers = async () => {
    return await db_1.prisma.user.findMany({
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
exports.getAllUsers = getAllUsers;
const updateUserInDb = async (id, data) => {
    return await db_1.prisma.user.update({
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
exports.updateUserInDb = updateUserInDb;
