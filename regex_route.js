const fs = require('fs');

let c = fs.readFileSync('frontend/src/api/booking.api.ts', 'utf8');

c = c.replace(
  /\/bookings\/reports\?startDate=/g,
  '/bookings/report?startDate='
);

fs.writeFileSync('frontend/src/api/booking.api.ts', c);
console.log("Fixed route to /report");
