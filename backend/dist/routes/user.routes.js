"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Only SUPER_ADMIN can manage users
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)("SUPER_ADMIN"));
router.route("/").get(user_controller_1.getAllUsers).post(user_controller_1.createUser);
router.route("/:id").patch(user_controller_1.updateUser);
router.route("/:id/reset-pin").patch(user_controller_1.resetPin);
exports.default = router;
