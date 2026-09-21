import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db";
export interface Booking {
  id: string;
  date: string;
  mealType: "BALBHOG" | "RAJBHOG" | "SAYANKALIN";
  status: "BOOKED" | "COMPLETED" | "CANCELLED";
  sponsorName: string;
  totalCount: number;
  occasion: string;
  mobileNumber: string;
  alternateNumber?: string;
  cityLocation: string;
  monksCount: number;
  guestsCount: number;
  specialInstructions: string;
  coSponsors: string;
  advanceAmount: number;
  costPerHead: number;
  valetParking: number;
  waiters: number;
  coolers: number;
  guards: number;
  masalchis: number;
  totalPayment: number;
  createdById?: string;
}

export const getAllBookings = async () => {
  return prisma.booking.findMany({
    orderBy: { date: "asc" },
    include: {
      createdByUser: { select: { name: true } },
      updatedByUser: { select: { name: true } },
    }
  });
};
export const findBookingByDateAndMeal = async (
  date: Date,
  mealType: "BALBHOG" | "RAJBHOG" | "SAYANKALIN",
) => {
  return await prisma.booking.findFirst({
    where: {
      // 2. Change how we search
      date: date,
      mealType: mealType,
    },
    // 3. Sort so we grab the newest attempt first!
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const newBooking = async (payload: Booking) => {
  const bookingData: Prisma.BookingCreateInput = {
    date: new Date(payload.date),
    mealType: payload.mealType,
    status: payload.status || "BOOKED",
    sponsorName: payload.sponsorName,
    monksCount: Number(payload.monksCount) || 0,
    guestsCount: Number(payload.guestsCount) || 0,
    totalCount: Number(payload.totalCount) || 0,
    specialInstructions: payload.specialInstructions,
    coSponsors: payload.coSponsors || [],
    occasion: payload.occasion,
    mobileNumber: payload.mobileNumber,
    cityLocation: payload.cityLocation,
    advanceAmount: payload.advanceAmount ? Number(payload.advanceAmount) : null,
    costPerHead: payload.costPerHead ? Number(payload.costPerHead) : null,
    valetParking: payload.valetParking ? Number(payload.valetParking) : 0,
    waiters: payload.waiters ? Number(payload.waiters) : 0,
    coolers: payload.coolers ? Number(payload.coolers) : 0,
    guards: payload.guards ? Number(payload.guards) : 0,
    masalchis: payload.masalchis ? Number(payload.masalchis) : 0,
    totalPayment: payload.totalPayment ? Number(payload.totalPayment) : null,
    createdByUser: payload.createdById ? { connect: { id: payload.createdById } } : undefined,
  };
  return await prisma.booking.create({
    data: bookingData,
  });
};
export type BookingStatusType = keyof typeof BookingStatus;

export const updateBookingStatusInDb = async (
  id: string,
  status: BookingStatusType,
) => {
  const updateData: any = {
    status: status,
  };
  if (status === BookingStatus.COMPLETED) {
    updateData.completedAt = new Date();
  }
  return await prisma.booking.update({
    where: {
      id: id,
    },
    data: updateData,
  });
};

export const getReportBookingsInDb = async (
  startDate: Date, 
  endDate: Date, 
  search: string, 
  skip?: number, 
  take?: number
) => {
  const where: any = {
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (search) {
    where.OR = [
      { sponsorName: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search } }
    ];
  }

  const [data, total, statsData] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { date: 'asc' },
      skip,
      take
    }),
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where }) // Easiest way to get all stats for the month since it's typically < 500 bookings
  ]);

  return { data, total, statsData };
};
