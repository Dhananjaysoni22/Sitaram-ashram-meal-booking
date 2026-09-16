import { computeFestivalsForYear } from "panchang-ts";

// Default to Vrindavan/Mathura coordinates if Ashram is located there, 
// or New Delhi. Let us use Mathura coordinates as a safe default for Vaishnava Ashrams:
// Lat: 27.4924, Lng: 77.6737
const DEFAULT_LOCATION = { latitude: 27.4924, longitude: 77.6737 };
const DEFAULT_OPTIONS = { timezone: "Asia/Kolkata" };

export const getFestivalsForMonthService = async (year: number, month: number) => {
  // computeFestivalsForYear takes (year, location, options)
  const allFestivals = computeFestivalsForYear(year, DEFAULT_LOCATION, DEFAULT_OPTIONS);
  
  // Filter for the requested month (1-12)
  // The returned dates are JavaScript Date objects representing midnight IST (or UTC matching IST)
  const monthlyFestivals = allFestivals.filter(f => {
    // getMonth() is 0-indexed, so we compare with month - 1
    // Using UTC methods since panchang-ts returns UTC times that correspond to midnight IST
    // (e.g. 18:30:00.000Z the day before)
    
    // To be perfectly safe, let us convert the UTC string back to a local IST string and check the month
    const dateInIST = new Date(f.date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return dateInIST.getMonth() + 1 === month;
  });

  // Group by date string (YYYY-MM-DD)
  const grouped: Record<string, any[]> = {};
  for (const f of monthlyFestivals) {
    // Format date as YYYY-MM-DD in IST
    const dateInIST = new Date(f.date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const y = dateInIST.getFullYear();
    const m = String(dateInIST.getMonth() + 1).padStart(2, "0");
    const d = String(dateInIST.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(f.festival);
  }

  return grouped;
};

export const getFestivalsForDateService = async (dateStr: string) => {
  // dateStr is YYYY-MM-DD
  const dateObj = new Date(dateStr);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  
  const monthlyGrouped = await getFestivalsForMonthService(year, month);
  return monthlyGrouped[dateStr] || [];
};

