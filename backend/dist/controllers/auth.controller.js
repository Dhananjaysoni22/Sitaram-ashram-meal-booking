"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const user_service_1 = require("../services/user.service");
const AppError_1 = require("../utils/AppError");
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username, pin } = req.body;
    if (!username || !pin) {
        throw new AppError_1.AppError("Please provide username and PIN", 400);
    }
    const result = await (0, user_service_1.loginService)(username, pin);
    res.status(200).json({
        success: true,
        data: result,
    });
});
