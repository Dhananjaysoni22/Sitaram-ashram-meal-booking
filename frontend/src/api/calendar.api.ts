import axiosClient from "./axiosClient";

export const getMonthlyFestivals = (year: number, month: number) => {
  return axiosClient.get(`/calendar/festivals/monthly?year=${year}&month=${month}`);
};

export const getDateFestivals = (date: string) => {
  return axiosClient.get(`/calendar/festivals/date?date=${date}`);
};
