import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFestivalsForMonthService = async (year: number, month: number) => {
  // Find festivals in the given year and month
  // Create start and end date for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const festivals = await prisma.festival.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      },
      isActive: true
    }
  });

  const grouped: Record<string, string[]> = {};
  
  for (const f of festivals) {
    const y = f.date.getFullYear();
    const m = String(f.date.getMonth() + 1).padStart(2, "0");
    const d = String(f.date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(f.name);
  }

  return grouped;
};

export const getFestivalsForDateService = async (dateStr: string) => {
  const dateObj = new Date(dateStr);
  const festivals = await prisma.festival.findMany({
    where: {
      date: {
        gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        lte: new Date(dateObj.setHours(23, 59, 59, 999))
      },
      isActive: true
    }
  });
  return festivals.map(f => f.name);
};

export const createFestivalService = async (date: Date, name: string) => {
  return await prisma.festival.create({
    data: { date, name }
  });
};

export const deleteFestivalService = async (id: string) => {
  return await prisma.festival.update({
    where: { id },
    data: { isActive: false }
  });
};

export const getAllFestivalsService = async () => {
  return await prisma.festival.findMany({
    where: { isActive: true },
    orderBy: { date: "asc" }
  });
};
