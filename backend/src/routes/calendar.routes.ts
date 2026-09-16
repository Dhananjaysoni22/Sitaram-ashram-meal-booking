import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { getMonthlyFestivals, getDateFestivals } from "../controllers/calendar.controller";

const router = express.Router();

router.use(protect);

router.get("/festivals/monthly", getMonthlyFestivals);
router.get("/festivals/date", getDateFestivals);

export default router;
