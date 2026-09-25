const fs = require('fs');

let c = fs.readFileSync('frontend/src/api/booking.api.ts', 'utf8');

c = c.replace(
  /export const getReportBookings = \([^]*?\};/m,
  `export const getReportBookings = (startDate: string, endDate: string, search: string = "", statusFilter: string = "", sortField: string = "date", sortOrder: string = "asc", page?: number, limit?: number) => {
  let url = \`/bookings/reports?startDate=\${startDate}&endDate=\${endDate}&search=\${search}&statusFilter=\${statusFilter}&sortField=\${sortField}&sortOrder=\${sortOrder}\`;
  if (page) url += \`&page=\${page}\`;
  if (limit) url += \`&limit=\${limit}\`;
  return axiosClient.get(url);
};`
);

fs.writeFileSync('frontend/src/api/booking.api.ts', c);
console.log("Updated api via regex!");
