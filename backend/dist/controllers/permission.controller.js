"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRolePermissions = exports.getMyPermissions = exports.getAllPermissions = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const permission_service_1 = require("../services/permission.service");
exports.getAllPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const permissions = await (0, permission_service_1.getAllPermissionsService)();
    res.json({ success: true, data: permissions });
});
exports.getMyPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const permissions = await (0, permission_service_1.getMyPermissionsService)(req.user.role);
    res.json({ success: true, data: permissions.map((p) => p.screen) });
});
exports.updateRolePermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { role, screens } = req.body;
    if (!role || !screens) {
        return res.status(400).json({ success: false, message: "Missing role or screens array" });
    }
    const updated = await (0, permission_service_1.updateRolePermissionsService)(role, screens);
    res.json({ success: true, data: updated });
});
