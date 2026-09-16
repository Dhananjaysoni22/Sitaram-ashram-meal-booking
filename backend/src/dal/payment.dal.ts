import { prisma } from "../config/db";

export const getPaymentsByWorkerIdInDb = async (workerId: string) => {
  return await prisma.payment.findMany({
    where: { workerId },
    orderBy: { paymentDate: 'desc' }
  });
};

export const getPaymentsByMonthInDb = async (startDate: Date, endDate: Date) => {
  return await prisma.payment.findMany({
    where: {
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      worker: true
    }
  });
};

export const createPaymentInDb = async (data: any) => {
  return await prisma.payment.create({
    data
  });
};
