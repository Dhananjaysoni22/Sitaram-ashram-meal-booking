import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("[Full Error Object]:", err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Handle Prisma Specifics or JWT specifics here if needed
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid Token" });
  }
  return res.status(500).json({ error: "Internal Server Error" });
};
