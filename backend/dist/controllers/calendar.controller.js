"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFestival = exports.createFestival = exports.getAllFestivals = exports.getDateFestivals = exports.getMonthlyFestivals = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const calendar_service_1 = require("../services/calendar.service");
exports.getMonthlyFestivals = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) {
        return res.status(400).json({ success: false, error: "year and month query parameters are required" });
    }
    const data = await (0, calendar_service_1.getFestivalsForMonthService)(Number(year), Number(month));
    res.json({ success: true, data });
});
exports.getDateFestivals = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
        return res.status(400).json({ success: false, error: "date query parameter (YYYY-MM-DD) is required" });
    }
    const data = await (0, calendar_service_1.getFestivalsForDateService)(date);
    res.json({ success: true, data });
});
exports.getAllFestivals = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, calendar_service_1.getAllFestivalsService)();
    res.json({ success: true, data });
});
exports.createFestival = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, name } = req.body;
    if (!date || !name)
        return res.status(400).json({ success: false, error: "date and name required" });
    const data = await (0, calendar_service_1.createFestivalService)(new Date(date), name);
    res.json({ success: true, data });
});
exports.deleteFestival = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, calendar_service_1.deleteFestivalService)(id);
    res.json({ success: true });
});
