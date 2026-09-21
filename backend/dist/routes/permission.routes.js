"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = require("../controllers/permission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Everyone logged in can fetch their own permissions
router.get("/my", auth_middleware_1.protect, permission_controller_1.getMyPermissions);
// Only Super Admin can view all and update
router.get("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("SUPER_ADMIN"), permission_controller_1.getAllPermissions);
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("SUPER_ADMIN"), permission_controller_1.updateRolePermissions);
exports.default = router;
