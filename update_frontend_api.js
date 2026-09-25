const fs = require('fs');

// 1. api/booking.api.ts
let api = fs.readFileSync('frontend/src/api/booking.api.ts', 'utf8');
const apiTarget = `export const getReportBookings = (startDate: string, endDate: string, search: string, page: number, limit: number) => {
  return axiosClient.get(\`/bookings/reports?startDate=\${startDate}&endDate=\${endDate}&search=\${search}&page=\${page}&limit=\${limit}\`);
};`;
const apiReplacement = `export const getReportBookings = (startDate: string, endDate: string, search: string, statusFilter: string, sortField: string, sortOrder: string, page: number, limit: number) => {
  return axiosClient.get(\`/bookings/reports?startDate=\${startDate}&endDate=\${endDate}&search=\${search}&statusFilter=\${statusFilter}&sortField=\${sortField}&sortOrder=\${sortOrder}&page=\${page}&limit=\${limit}\`);
};`;
api = api.replace(apiTarget, apiReplacement);
api = api.replace(apiTarget.replace(/\r\n/g, '\n'), apiReplacement);
fs.writeFileSync('frontend/src/api/booking.api.ts', api);

console.log("Updated api");
