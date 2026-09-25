const fs = require('fs');

// 1. Rewrite booking.dal.ts
let dal = fs.readFileSync('backend/src/dal/booking.dal.ts', 'utf8');
const dalTarget = `export const getReportBookingsInDb = async (
  startDate: Date, 
  endDate: Date, 
  search: string, 
  skip?: number, 
  take?: number
) => {
  const where: any = {
    isDeleted: false,
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
};`;

const dalReplacement = `export const getReportBookingsInDb = async (
  startDate: Date, 
  endDate: Date, 
  search: string, 
  statusFilter?: string,
  sortField: string = 'date',
  sortOrder: 'asc' | 'desc' = 'asc',
  skip?: number, 
  take?: number
) => {
  const baseWhere: any = {
    isDeleted: false,
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (search) {
    const s = search.trim();
    const searchNum = Number(s);
    baseWhere.OR = [
      { sponsorName: { contains: s, mode: 'insensitive' } },
      { mobileNumber: { contains: s } },
      { cityLocation: { contains: s, mode: 'insensitive' } },
      { occasion: { contains: s, mode: 'insensitive' } }
    ];
    if (!isNaN(searchNum) && s !== '') {
      baseWhere.OR.push({ totalCount: searchNum });
    }
  }

  const tableWhere = { ...baseWhere };
  if (statusFilter) {
    tableWhere.status = statusFilter;
  }

  const orderByObj: any = {};
  if (sortField) {
    orderByObj[sortField] = sortOrder;
  } else {
    orderByObj.date = 'asc';
  }

  const [data, total, statsData] = await Promise.all([
    prisma.booking.findMany({
      where: tableWhere,
      orderBy: orderByObj,
      skip,
      take
    }),
    prisma.booking.count({ where: tableWhere }),
    prisma.booking.findMany({ where: baseWhere })
  ]);

  return { data, total, statsData };
};`;
dal = dal.replace(dalTarget, dalReplacement);
dal = dal.replace(dalTarget.replace(/\r\n/g, '\n'), dalReplacement); // Handle line endings
fs.writeFileSync('backend/src/dal/booking.dal.ts', dal);

// 2. Rewrite booking.service.ts
let srv = fs.readFileSync('backend/src/services/booking.service.ts', 'utf8');
const srvTarget = `export const getReportBookingsService = async (
  startDateStr: string,
  endDateStr: string,
  search: string,
  limit?: number,
  skip?: number
) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const { data, total, statsData } = await getReportBookingsInDb(startDate, endDate, search, skip, limit);`;

const srvReplacement = `export const getReportBookingsService = async (
  startDateStr: string,
  endDateStr: string,
  search: string,
  statusFilter?: string,
  sortField?: string,
  sortOrder?: 'asc'|'desc',
  limit?: number,
  skip?: number
) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const { data, total, statsData } = await getReportBookingsInDb(startDate, endDate, search, statusFilter, sortField, sortOrder, skip, limit);`;
srv = srv.replace(srvTarget, srvReplacement);
srv = srv.replace(srvTarget.replace(/\r\n/g, '\n'), srvReplacement);
fs.writeFileSync('backend/src/services/booking.service.ts', srv);


// 3. Rewrite booking.controller.ts
let ctrl = fs.readFileSync('backend/src/controllers/booking.controller.ts', 'utf8');
const ctrlTarget = `export const getReportBookings = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, search, page, limit } = req.query;
  const limitNum = limit ? Number(limit) : undefined;
  const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

  const result = await getReportBookingsService(
    startDate as string,
    endDate as string,
    search as string || "",
    limitNum,
    skipNum
  );`;
const ctrlReplacement = `export const getReportBookings = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, search, statusFilter, sortField, sortOrder, page, limit } = req.query;
  const limitNum = limit ? Number(limit) : undefined;
  const skipNum = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

  const result = await getReportBookingsService(
    startDate as string,
    endDate as string,
    search as string || "",
    statusFilter as string || "",
    sortField as string || "date",
    (sortOrder as 'asc'|'desc') || "asc",
    limitNum,
    skipNum
  );`;
ctrl = ctrl.replace(ctrlTarget, ctrlReplacement);
ctrl = ctrl.replace(ctrlTarget.replace(/\r\n/g, '\n'), ctrlReplacement);
fs.writeFileSync('backend/src/controllers/booking.controller.ts', ctrl);

console.log("Backend updated!");
