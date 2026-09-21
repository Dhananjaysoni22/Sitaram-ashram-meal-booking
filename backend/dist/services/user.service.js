"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPinService = exports.editUserService = exports.createUserService = exports.fetchAllUsersService = exports.loginService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_dal_1 = require("../dal/user.dal");
const AppError_1 = require("../utils/AppError");
const db_1 = require("../config/db");
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "30d",
    });
};
const loginService = async (username, pin) => {
    const user = await (0, user_dal_1.findUserByUsername)(username);
    if (!user || !user.isActive) {
        throw new AppError_1.AppError("Invalid credentials or account inactive", 401);
    }
    const isMatch = await bcrypt_1.default.compare(pin, user.passwordHash);
    if (!isMatch) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const token = generateToken(user.id, user.role);
    return {
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
        },
        token,
    };
};
exports.loginService = loginService;
const fetchAllUsersService = async () => {
    return await (0, user_dal_1.getAllUsers)();
};
exports.fetchAllUsersService = fetchAllUsersService;
const createUserService = async (name, username, pin, role) => {
    const existing = await (0, user_dal_1.findUserByUsername)(username);
    if (existing) {
        throw new AppError_1.AppError("Username already exists", 400);
    }
    const passwordHash = await bcrypt_1.default.hash(pin, 10);
    return await db_1.prisma.user.create({
        data: { name, username, passwordHash, role, isActive: true },
        select: { id: true, name: true, username: true, role: true, isActive: true }
    });
};
exports.createUserService = createUserService;
const editUserService = async (id, name, username, role, isActive) => {
    return await (0, user_dal_1.updateUserInDb)(id, { name, username, role, isActive });
};
exports.editUserService = editUserService;
const resetUserPinService = async (id, newPin) => {
    const passwordHash = await bcrypt_1.default.hash(newPin, 10);
    return await (0, user_dal_1.updateUserInDb)(id, { passwordHash });
};
exports.resetUserPinService = resetUserPinService;
