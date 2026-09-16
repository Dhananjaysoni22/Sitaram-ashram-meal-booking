import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { findUserById } from "../dal/user.dal";

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as DecodedToken;
    const user = await findUserById(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError("User no longer exists or is inactive", 401));
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!roles.includes(user.role)) {
      return next(new AppError(`User role ${user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};
