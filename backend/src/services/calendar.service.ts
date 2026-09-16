import { customFestivals } from "../utils/customCalendar";

export const getFestivalsForMonthService = async (year: number, month: number) => {
  const grouped: Record<string, string[]> = {};
  
  // Month string (01 to 12)
  const monthStr = String(month).padStart(2, "0");
  const prefix = `${year}-${monthStr}-`;

  for (const [dateStr, festivals] of Object.entries(customFestivals)) {
    if (dateStr.startsWith(prefix)) {
      grouped[dateStr] = festivals;
    }
  }

  return grouped;
};

export const getFestivalsForDateService = async (dateStr: string) => {
  return customFestivals[dateStr] || [];
};
