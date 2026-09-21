"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const setup_controller_1 = require("../controllers/setup.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect); // all routes need auth
// Occasions
router.route("/occasions")
    .get(setup_controller_1.getOccasions)
    .post((0, auth_middleware_1.authorize)("SUPER_ADMIN"), setup_controller_1.createOccasion);
router.route("/occasions/:id")
    .delete((0, auth_middleware_1.authorize)("SUPER_ADMIN"), setup_controller_1.deleteOccasion);
// Worker Categories
router.route("/worker-categories")
    .get(setup_controller_1.getWorkerCategories)
    .post((0, auth_middleware_1.authorize)("SUPER_ADMIN"), setup_controller_1.createWorkerCategory);
router.route("/worker-categories/:id")
    .delete((0, auth_middleware_1.authorize)("SUPER_ADMIN"), setup_controller_1.deleteWorkerCategory);
// Roles
router.route("/roles")
    .get(setup_controller_1.getRoles)
    .post((0, auth_middleware_1.authorize)("SUPER_ADMIN"), setup_controller_1.createRole);
router.route("/roles/:id")
    .delete((0, auth_middleware_1.authorize)("SUPER_ADMIN"), setup_controller_1.deleteRole);
exports.default = router;
