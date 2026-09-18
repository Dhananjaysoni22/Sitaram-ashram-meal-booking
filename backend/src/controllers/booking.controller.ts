import {
  getAllbookings,
  newBooking as createBookingService,
  updateBookingStatus,
  updateBookingDetailsService,
  getReportBookingsService,
  swapBookingsService
} from "../services/booking.service";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { Response, Request } from "express";

export const getAllBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const bookings = await getAllbookings();
    res.json(bookings);
  },
);

export const getReportBookings = asyncHandler(async (req: Request, res: Response) => {
  const { year, month, search, page, limit } = req.query;
  const limitNum = limit ? Number(limit) : undefined;
  const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

  const result = await getReportBookingsService(
    Number(year),
    Number(month),
    search as string || "",
    limitNum,
    skipNum
  );
  res.json({
    success: true,
    data: result.data,
    total: result.total,
    stats: result.stats,
    page: Number(page) || 1,
    limit: limitNum
  });
});

export const newBooking = asyncHandler(async (req: Request, res: Response) => {
  const { date, mealType, sponsorName, mobileNumber } = req.body;
  const userId = (req as any).user?.id;

  if (!date || !mealType || !sponsorName || !mobileNumber) {
    throw new AppError(
      "Please provide date, mealType, sponsorName, and mobileNumber",
      400,
    );
  }

  const booking = await createBookingService(req.body, userId);
  res.status(201).json({
    success: true,
    data: booking,
  });
});

export const updateStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const status = req.body.status;
    const updateBooking = await updateBookingStatus(id as string, status as any);
    res.status(200).json({
      success: true,
      data: updateBooking,
    });
  },
);

export const updateBookingDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const userRole = (req as any).user?.role || "COORDINATOR"; // default just in case
    const userId = (req as any).user?.id;
    const updated = await updateBookingDetailsService(id as string, req.body, userRole as string, userId as string);
    res.status(200).json({
      success: true,
      data: updated,
    });
  },
);

export const swapBookings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Only an Admin can swap bookings.", 403);
  }
  const { date, baseMealType } = req.params;
  await swapBookingsService(date as string, baseMealType as string, user.id);
  res.json({ success: true, message: "Bookings swapped successfully" });
});

