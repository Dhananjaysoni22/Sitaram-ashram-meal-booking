"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkerInDb = exports.updateWorkerInDb = exports.createWorkerInDb = exports.countAllWorkersInDb = exports.getAllWorkersInDb = void 0;
const db_1 = require("../config/db");
const getAllWorkersInDb = async (workerType = "ASHRAM", limit, skip) => {
    return await db_1.prisma.worker.findMany({
        where: { isDeleted: false, workerType },
        orderBy: { name: 'asc' },
        take: limit,
        skip: skip
    });
};
exports.getAllWorkersInDb = getAllWorkersInDb;
const countAllWorkersInDb = async (workerType = "ASHRAM") => {
    return await db_1.prisma.worker.count({ where: { isDeleted: false, workerType } });
};
exports.countAllWorkersInDb = countAllWorkersInDb;
const createWorkerInDb = async (data) => {
    return await db_1.prisma.worker.create({
        data
    });
};
exports.createWorkerInDb = createWorkerInDb;
const updateWorkerInDb = async (id, data) => {
    return await db_1.prisma.worker.update({
        where: { id },
        data
    });
};
exports.updateWorkerInDb = updateWorkerInDb;
const deleteWorkerInDb = async (id) => { return await db_1.prisma.worker.update({ where: { id }, data: { isDeleted: true } }); };
exports.deleteWorkerInDb = deleteWorkerInDb;
