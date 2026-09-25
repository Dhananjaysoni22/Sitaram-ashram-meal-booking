"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.createRole = exports.getRoles = exports.deleteWorkerCategory = exports.createWorkerCategory = exports.getWorkerCategories = exports.deleteOccasion = exports.createOccasion = exports.getOccasions = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const setup_service_1 = require("../services/setup.service");
exports.getOccasions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, setup_service_1.getOccasionsService)();
    res.json({ success: true, data });
});
exports.createOccasion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, setup_service_1.createOccasionService)(req.body.name);
    res.json({ success: true, data });
});
exports.deleteOccasion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, setup_service_1.deleteOccasionService)(req.params.id);
    res.json({ success: true });
});
exports.getWorkerCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, setup_service_1.getWorkerCategoriesService)(req.query.type || "ASHRAM");
    res.json({ success: true, data });
});
exports.createWorkerCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, setup_service_1.createWorkerCategoryService)(req.body.name, req.body.type || "ASHRAM");
    res.json({ success: true, data });
});
exports.deleteWorkerCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, setup_service_1.deleteWorkerCategoryService)(req.params.id);
    res.json({ success: true });
});
exports.getRoles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, setup_service_1.getRolesService)();
    res.json({ success: true, data });
});
exports.createRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, setup_service_1.createRoleService)(req.body.name);
    res.json({ success: true, data });
});
exports.deleteRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, setup_service_1.deleteRoleService)(req.params.id);
    res.json({ success: true });
});
