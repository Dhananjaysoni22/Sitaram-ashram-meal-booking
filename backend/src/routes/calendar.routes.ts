import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware";
import { 
  getMonthlyFestivals, 
  getDateFestivals,
  getAllFestivals,
  createFestival,
  deleteFestival
} from "../controllers/calendar.controller";

const router = express.Router();

router.use(protect);

router.get("/festivals/monthly", getMonthlyFestivals);
router.get("/festivals/date", getDateFestivals);

// Super Admin only routes for managing festivals
router.get("/festivals", authorize("SUPER_ADMIN"), getAllFestivals);
router.post("/festivals", authorize("SUPER_ADMIN"), createFestival);
router.delete("/festivals/:id", authorize("SUPER_ADMIN"), deleteFestival);

export default router;
