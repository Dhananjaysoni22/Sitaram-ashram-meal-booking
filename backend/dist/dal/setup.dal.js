"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.createRole = exports.getRoles = exports.deleteWorkerCategory = exports.createWorkerCategory = exports.getWorkerCategories = exports.deleteOccasion = exports.createOccasion = exports.getOccasions = void 0;
const db_1 = require("../config/db");
const getOccasions = async () => {
    return await db_1.prisma.setupOccasion.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
    });
};
exports.getOccasions = getOccasions;
const createOccasion = async (name) => {
    return await db_1.prisma.setupOccasion.create({ data: { name } });
};
exports.createOccasion = createOccasion;
const deleteOccasion = async (id) => {
    return await db_1.prisma.setupOccasion.update({
        where: { id },
        data: { isActive: false }
    });
};
exports.deleteOccasion = deleteOccasion;
const getWorkerCategories = async () => {
    return await db_1.prisma.setupWorkerCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
    });
};
exports.getWorkerCategories = getWorkerCategories;
const createWorkerCategory = async (name) => {
    return await db_1.prisma.setupWorkerCategory.create({ data: { name } });
};
exports.createWorkerCategory = createWorkerCategory;
const deleteWorkerCategory = async (id) => {
    return await db_1.prisma.setupWorkerCategory.update({
        where: { id },
        data: { isActive: false }
    });
};
exports.deleteWorkerCategory = deleteWorkerCategory;
const getRoles = async () => {
    return await db_1.prisma.setupRole.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
    });
};
exports.getRoles = getRoles;
const createRole = async (name) => {
    return await db_1.prisma.setupRole.create({ data: { name } });
};
exports.createRole = createRole;
const deleteRole = async (id) => {
    return await db_1.prisma.setupRole.update({
        where: { id },
        data: { isActive: false }
    });
};
exports.deleteRole = deleteRole;
