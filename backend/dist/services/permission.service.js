"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRolePermissionsService = exports.getMyPermissionsService = exports.getAllPermissionsService = void 0;
const permission_dal_1 = require("../dal/permission.dal");
const getAllPermissionsService = async () => {
    return await (0, permission_dal_1.getAllPermissionsInDb)();
};
exports.getAllPermissionsService = getAllPermissionsService;
const getMyPermissionsService = async (role) => {
    return await (0, permission_dal_1.getPermissionsForRoleInDb)(role);
};
exports.getMyPermissionsService = getMyPermissionsService;
const updateRolePermissionsService = async (role, screens) => {
    return await (0, permission_dal_1.setPermissionsForRoleInDb)(role, screens);
};
exports.updateRolePermissionsService = updateRolePermissionsService;
