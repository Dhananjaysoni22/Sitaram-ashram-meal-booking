"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const user_dal_1 = require("../dal/user.dal");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new AppError_1.AppError("Not authorized to access this route", 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        const user = await (0, user_dal_1.findUserById)(decoded.id);
        if (!user || !user.isActive) {
            return next(new AppError_1.AppError("User no longer exists or is inactive", 401));
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        return next(new AppError_1.AppError("Not authorized to access this route", 401));
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!roles.includes(user.role)) {
            return next(new AppError_1.AppError(`User role ${user.role} is not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
