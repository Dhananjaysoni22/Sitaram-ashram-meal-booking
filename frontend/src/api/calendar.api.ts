import axiosClient from "./axiosClient";

export const getMonthlyFestivals = (year: number, month: number) => {
  return axiosClient.get(`/calendar/festivals/monthly?year=${year}&month=${month}`);
};

export const getDateFestivals = (date: string) => {
  return axiosClient.get(`/calendar/festivals/date?date=${date}`);
};

export const getAllFestivals = () => {
  return axiosClient.get("/calendar/festivals");
};

export const createFestival = (data: { date: string, name: string }) => {
  return axiosClient.post("/calendar/festivals", data);
};

export const deleteFestival = (id: string) => {
  return axiosClient.delete(`/calendar/festivals/${id}`);
};
