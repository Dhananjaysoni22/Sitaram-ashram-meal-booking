import axiosClient from "./axiosClient";
// Example:
export interface Booking {
  id: string;
  date: string;
  mealType: "BALBHOG" | "RAJBHOG" | "SAYANKALIN" | "RAJBHOG_FIRST_FLOOR" | "SAYANKALIN_FIRST_FLOOR";
  status: "BOOKED" | "COMPLETED" | "CANCELLED";
  sponsorName: string;
  totalCount: number;
  occasion: string;
  mobileNumber: string;
  alternateNumber?: string;
  cityLocation: string;
  monksCount: number;
  guestsCount: number;
  specialInstructions: string;
  coSponsors: string;
}
export const getAllBookings = () => {
  return axiosClient.get("/bookings");
};
export const newBooking = (data: Omit<Booking, "id" | "status">) => {
  return axiosClient.post("/bookings", data);
};
export const getReportBookings = (startDate: string, endDate: string, search: string = "", page: number = 1, limit: number = 50) => {
  return axiosClient.get(`/bookings/report?startDate=${startDate}&endDate=${endDate}&search=${search}&page=${page}&limit=${limit}`);
};

export const updateBookingStatus = (
  id: string,
  status: "COMPLETED" | "CANCELLED",
) => {
  return axiosClient.patch(`/bookings/${id}/status`, { status });
};

export const swapBookings = (date: string, baseMealType: string) => {
  return axiosClient.post(`/bookings/swap/${date}/${baseMealType}`);
};


export const deleteBooking = (id: string) => {
  return axiosClient.delete(`/bookings/${id}`);
};
