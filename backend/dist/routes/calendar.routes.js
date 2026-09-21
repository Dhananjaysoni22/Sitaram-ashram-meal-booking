"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const calendar_controller_1 = require("../controllers/calendar.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get("/festivals/monthly", calendar_controller_1.getMonthlyFestivals);
router.get("/festivals/date", calendar_controller_1.getDateFestivals);
// Super Admin only routes for managing festivals
router.get("/festivals", (0, auth_middleware_1.authorize)("SUPER_ADMIN"), calendar_controller_1.getAllFestivals);
router.post("/festivals", (0, auth_middleware_1.authorize)("SUPER_ADMIN"), calendar_controller_1.createFestival);
router.delete("/festivals/:id", (0, auth_middleware_1.authorize)("SUPER_ADMIN"), calendar_controller_1.deleteFestival);
exports.default = router;
