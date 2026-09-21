"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// src/config/db.ts
const client_1 = require("@prisma/client");
// Extend the global object to store the Prisma instance safely in development
const globalForPrisma = globalThis;
// Use the existing instance if it exists, or create a brand new one
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
// Cache the instance in development so hot-reloading doesn't create new connection pools
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
