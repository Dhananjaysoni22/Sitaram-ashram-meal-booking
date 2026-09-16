// src/config/db.ts
import { PrismaClient } from "@prisma/client";

// Extend the global object to store the Prisma instance safely in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Use the existing instance if it exists, or create a brand new one
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Cache the instance in development so hot-reloading doesn't create new connection pools
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
