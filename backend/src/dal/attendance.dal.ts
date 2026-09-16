import { prisma } from "../config/db";

export const getAttendanceByDateInDb = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay
      }
    },
    include: {
      worker: true
    }
  });
};

export const getAttendanceByMonthInDb = async (startDate: Date, endDate: Date) => {
  return await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      worker: true
    }
  });
};

export const upsertAttendanceInDb = async (workerId: string, date: Date, data: any) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  return await prisma.attendance.upsert({
    where: {
      workerId_date: {
        workerId,
        date: startOfDay
      }
    },
    update: data,
    create: {
      workerId,
      date: startOfDay,
      ...data
    }
  });
};
