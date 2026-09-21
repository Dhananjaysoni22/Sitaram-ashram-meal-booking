"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, next) => {
    console.error("[Full Error Object]:", err);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    // Handle Prisma Specifics or JWT specifics here if needed
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid Token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
};
exports.errorHandler = errorHandler;
