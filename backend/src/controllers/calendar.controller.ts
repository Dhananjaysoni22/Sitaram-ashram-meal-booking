import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getFestivalsForMonthService, getFestivalsForDateService } from "../services/calendar.service";

export const getMonthlyFestivals = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ success: false, error: "year and month query parameters are required" });
  }

  const data = await getFestivalsForMonthService(Number(year), Number(month));
  res.json({ success: true, data });
});

export const getDateFestivals = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    return res.status(400).json({ success: false, error: "date query parameter (YYYY-MM-DD) is required" });
  }

  const data = await getFestivalsForDateService(date);
  res.json({ success: true, data });
});
