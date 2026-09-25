const fs = require('fs');

let api = fs.readFileSync('frontend/src/api/booking.api.ts', 'utf8');
const apiTarget = `export const getReportBookings = (startDate: string, endDate: string, search: string, statusFilter: string, sortField: string, sortOrder: string, page: number, limit: number) => {
  return axiosClient.get(\`/bookings/reports?startDate=\${startDate}&endDate=\${endDate}&search=\${search}&statusFilter=\${statusFilter}&sortField=\${sortField}&sortOrder=\${sortOrder}&page=\${page}&limit=\${limit}\`);
};`;
const apiReplacement = `export const getReportBookings = (startDate: string, endDate: string, search: string = "", statusFilter: string = "", sortField: string = "date", sortOrder: string = "asc", page?: number, limit?: number) => {
  let url = \`/bookings/reports?startDate=\${startDate}&endDate=\${endDate}&search=\${search}&statusFilter=\${statusFilter}&sortField=\${sortField}&sortOrder=\${sortOrder}\`;
  if (page) url += \`&page=\${page}\`;
  if (limit) url += \`&limit=\${limit}\`;
  return axiosClient.get(url);
};`;
api = api.replace(apiTarget, apiReplacement);
api = api.replace(apiTarget.replace(/\r\n/g, '\n'), apiReplacement);
fs.writeFileSync('frontend/src/api/booking.api.ts', api);
console.log("Fixed API signature");
