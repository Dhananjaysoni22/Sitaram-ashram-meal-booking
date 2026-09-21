import {
  getAllBookings,
  newBooking as createBookingInDb,
  Booking,
  findBookingByDateAndMeal,
  BookingStatusType,
  updateBookingStatusInDb,
  getReportBookingsInDb,
} from "../dal/booking.dal";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/db";

export const getAllbookings = async () => {
  return getAllBookings();
};

export const newBooking = async (data: Booking, userId: string) => {
  const targetDate = new Date(data.date);
  const exisiting = await findBookingByDateAndMeal(targetDate, data.mealType);
  if (exisiting && exisiting.status !== "CANCELLED") {
    throw new AppError("Duplicate Booking", 400);
  }
  return await createBookingInDb({ ...data, createdById: userId } as any);
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatusType,
) => {
  return await updateBookingStatusInDb(id, status);
};

export const updateBookingDetailsService = async (id: string, updateData: any, userRole: string, userId: string) => {
  const currentBooking = await prisma.booking.findUnique({ where: { id } });
  if (!currentBooking) throw new AppError("Booking not found", 404);

  // Check advanceAmount security rule
  const incomingAdvance = updateData.advanceAmount !== undefined ? 
    (updateData.advanceAmount ? Number(updateData.advanceAmount) : null) 
    : undefined;

  if (currentBooking.advanceAmount && currentBooking.advanceAmount > 0) {
    if (incomingAdvance !== undefined && incomingAdvance !== currentBooking.advanceAmount) {
      if (userRole !== "SUPER_ADMIN") {
        throw new AppError("Only an Admin can modify the Advance Amount once it has been paid.", 403);
      }
    }
  }

  const checkDate = updateData.date ? new Date(updateData.date) : currentBooking.date;
  const checkMeal = updateData.mealType || currentBooking.mealType;

  const startOfDay = new Date(checkDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(checkDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Check for collisions if date or mealType is changing
  if (updateData.date || updateData.mealType) {
    const existing = await prisma.booking.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        mealType: checkMeal,
        status: { not: "CANCELLED" },
        id: { not: id }
      }
    });
    
    if (existing) {
      throw new AppError("This date and meal slot is already booked by someone else.", 400);
    }
  }

  // Ensure total is recalculated
  const monks = updateData.monksCount !== undefined ? Number(updateData.monksCount) : currentBooking.monksCount;
  const guests = updateData.guestsCount !== undefined ? Number(updateData.guestsCount) : currentBooking.guestsCount;
  
  const finalData = {
    ...updateData,
    updatedById: userId,
    date: updateData.date ? new Date(updateData.date) : undefined,
    monksCount: monks,
    guestsCount: guests,
    totalCount: monks + guests,
    advanceAmount: updateData.advanceAmount !== undefined ? (updateData.advanceAmount ? Number(updateData.advanceAmount) : null) : undefined,
    costPerHead: updateData.costPerHead !== undefined ? (updateData.costPerHead ? Number(updateData.costPerHead) : null) : undefined,
    valetParking: updateData.valetParking !== undefined ? Number(updateData.valetParking) : undefined,
    waiters: updateData.waiters !== undefined ? Number(updateData.waiters) : undefined,
    coolers: updateData.coolers !== undefined ? Number(updateData.coolers) : undefined,
    guards: updateData.guards !== undefined ? Number(updateData.guards) : undefined,
    masalchis: updateData.masalchis !== undefined ? Number(updateData.masalchis) : undefined,
    totalPayment: updateData.totalPayment !== undefined ? (updateData.totalPayment ? Number(updateData.totalPayment) : null) : undefined,
  };

  return await prisma.booking.update({
    where: { id },
    data: finalData,
  });
};

export const getReportBookingsService = async (
  startDateStr: string,
  endDateStr: string,
  search: string,
  limit?: number,
  skip?: number
) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const { data, total, statsData } = await getReportBookingsInDb(startDate, endDate, search, skip, limit);

  const stats = {
    totalBookings: statsData.filter((b: any) => b.status !== "CANCELLED").length,
    completed: statsData.filter((b: any) => b.status === "COMPLETED").length,
    cancelled: statsData.filter((b: any) => b.status === "CANCELLED").length,
    totalMonks: statsData.filter((b: any) => b.status !== "CANCELLED").reduce((acc: number, b: any) => acc + (b.monksCount || 0), 0),
    totalGuests: statsData.filter((b: any) => b.status !== "CANCELLED").reduce((acc: number, b: any) => acc + (b.guestsCount || 0), 0),
  };

  return { data, total, stats };
};

export const swapBookingsService = async (dateStr: string, baseMealType: string, userId: string) => {
  const targetDate = new Date(dateStr);
  const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

  const floorMeal = baseMealType + "_FIRST_FLOOR";

  const groundBooking = await prisma.booking.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay }, mealType: baseMealType as any, status: { not: "CANCELLED" } } });
  const firstFloorBooking = await prisma.booking.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay }, mealType: floorMeal as any, status: { not: "CANCELLED" } } });

  if (!groundBooking || !firstFloorBooking) throw new AppError("Both Ground and First Floor must be booked to swap them.", 400);

  await prisma.$transaction([
    prisma.booking.update({ where: { id: groundBooking.id }, data: { mealType: floorMeal as any, updatedById: userId } }),
    prisma.booking.update({ where: { id: firstFloorBooking.id }, data: { mealType: baseMealType as any, updatedById: userId } })
  ]);
};

