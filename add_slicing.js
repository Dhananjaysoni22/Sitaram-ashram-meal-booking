const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Home.tsx', 'utf8');

// Add paginatedUpcoming right after upcomingBookings definition
const searchStr = `.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());`;
const replaceStr = `.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const paginatedUpcoming = upcomingBookings.slice(
    (upcomingPage - 1) * upcomingLimit,
    upcomingPage * upcomingLimit
  );`;

c = c.replace(searchStr, replaceStr);

// Replace mapping
const mapStr = `<tbody className="divide-y divide-[#ece4da]">
                  {upcomingBookings.map((b) => (`;
const newMapStr = `<tbody className="divide-y divide-[#ece4da]">
                  {paginatedUpcoming.map((b) => (`;

c = c.replace(mapStr, newMapStr);

fs.writeFileSync('frontend/src/pages/Home.tsx', c);
console.log("Done");
