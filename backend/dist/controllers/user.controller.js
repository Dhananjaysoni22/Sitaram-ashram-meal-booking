"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPin = exports.updateUser = exports.createUser = exports.getAllUsers = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const user_service_1 = require("../services/user.service");
const AppError_1 = require("../utils/AppError");
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const users = await (0, user_service_1.fetchAllUsersService)();
    res.status(200).json({ success: true, data: users });
});
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, username, pin, role } = req.body;
    if (!name || !username || !pin)
        throw new AppError_1.AppError("Name, username, and pin are required", 400);
    const newUser = await (0, user_service_1.createUserService)(name, username, pin, role || 'BOOKING_COORDINATOR');
    res.status(201).json({ success: true, data: newUser });
});
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, username, role, isActive } = req.body;
    const updatedUser = await (0, user_service_1.editUserService)(id, name, username, role, isActive);
    res.status(200).json({ success: true, data: updatedUser });
});
exports.resetPin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { pin } = req.body;
    if (!pin)
        throw new AppError_1.AppError("New PIN is required", 400);
    await (0, user_service_1.resetUserPinService)(id, pin);
    res.status(200).json({ success: true, message: "PIN reset successfully" });
});
