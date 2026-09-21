import React, { useEffect, useState } from "react";
import { format, isAfter, startOfDay } from "date-fns";
import { hi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { generateBookingPDF } from "../utils/pdfGenerator";
import {
  getAllBookings,
  updateBookingStatus,
  swapBookings,
} from "../api/booking.api";
import EditBookingModal from "../components/EditBookingModal";
import { useNavigate } from "react-router-dom";
import ViewBookingModal from "../components/ViewBookingModal";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, allowedScreens } = useAuth();
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingLimit, setUpcomingLimit] = useState(10);
  const [viewBooking, setViewBooking] = useState<any>(null);
  const today = new Date();
  const navigate = useNavigate();
  const canEditBooking =
    user?.role === "SUPER_ADMIN" || user?.role === "BOOKING_COORDINATOR";

  const isHindi = i18n.language === "hi";
  const localeToUse = isHindi ? hi : enUS;
  const dateFormat = isHindi ? "EEEE, dd MMMM yyyy" : "EEEE, MMMM dd, yyyy";

  useEffect(() => {
    getAllBookings()
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchBookings = () => {
    getAllBookings()
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) => console.error(err));
  };

  const handleComplete = async (id: string) => {
    try {
      await updateBookingStatus(id, "COMPLETED");
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwap = async (baseMealType: string) => {
    try {
      const dateStr = format(today, "yyyy-MM-dd");
      await swapBookings(dateStr, baseMealType);
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Error swapping bookings");
    }
  };

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(t("ConfirmCancel"));
    if (!confirmed) return;
    try {
      await updateBookingStatus(id, "CANCELLED");
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = (booking: any) => {
    generateBookingPDF(booking, t);
  };

  const meals = [
    { type: "BALBHOG", name: t("Balbhog"), subtitle: t("BalbhogDesc") },
    { type: "RAJBHOG", name: t("Rajbhog"), subtitle: t("RajbhogDesc") },
    {
      type: "RAJBHOG_FIRST_FLOOR",
      name: t("RajbhogFF"),
      subtitle: t("RajbhogFFDesc"),
    },
    {
      type: "SAYANKALIN",
      name: t("Sayankalin"),
      subtitle: t("SayankalinDesc"),
    },
    {
      type: "SAYANKALIN_FIRST_FLOOR",
      name: t("SayankalinFF"),
      subtitle: t("SayankalinFFDesc"),
    },
  ];

  const upcomingBookings = bookings
    .filter(
      (b) =>
        isAfter(startOfDay(new Date(b.date)), startOfDay(today)) &&
        b.status !== "CANCELLED",
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const paginatedUpcoming = upcomingBookings.slice(
    (upcomingPage - 1) * upcomingLimit,
    upcomingPage * upcomingLimit,
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* ---------------- TODAY'S MEALS ---------------- */}
      <div className="space-y-4">
        <div className="bg-[#fef7e7] border border-[#f5e3cd] rounded-2xl p-4 shadow-sm">
          <h2 className="text-[17px] font-bold text-[#4a3b2c] mb-1">
            {t("TodayMealSystem")} •{" "}
            {format(today, dateFormat, { locale: localeToUse })}
          </h2>
          <p className="text-sm font-medium text-[#8a7662]">
            {t("MealSubhead")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {meals.map((meal) => {
            const booking = bookings.find(
              (b: any) =>
                b.mealType === meal.type &&
                new Date(b.date).toDateString() === today.toDateString() &&
                b.status !== "CANCELLED",
            );

            const floorBooking =
              meal.type === "RAJBHOG" || meal.type === "SAYANKALIN"
                ? bookings.find(
                    (b: any) =>
                      b.mealType === meal.type + "_FIRST_FLOOR" &&
                      new Date(b.date).toDateString() ===
                        today.toDateString() &&
                      b.status !== "CANCELLED",
                  )
                : null;

            return (
              <div
                key={meal.type}
                className="bg-white rounded-2xl shadow-sm border border-[#ece4da] p-5 relative"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-[#3d2f23]">
                    {meal.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-bold text-center inline-block min-w-[70px] ${
                      booking
                        ? booking.status === "COMPLETED"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-700"
                        : "bg-[#e8f5e9] text-[#2e7d32]"
                    }`}
                  >
                    {booking
                      ? booking.status === "COMPLETED"
                        ? t("ServiceCompleted")
                        : t("ServiceBooked")
                      : t("ServiceAvailable")}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-500 mb-4">
                  {meal.subtitle}
                </p>

                {booking ? (
                  <div className="space-y-3">
                    <p className="text-[15px] font-medium text-gray-700">
                      {t("ServiceBookedBy")}{" "}
                      <strong>{booking.sponsorName}</strong>
                      {isHindi && " द्वारा बुक किया गया"}
                    </p>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex justify-between">
                        <p>
                          <strong>{t("OccasionLabel")}:</strong>{" "}
                          {booking.occasion || "-"}
                        </p>
                        <button
                          className="cursor-pointer border py-1 px-2 rounded-xl hover:bg-[#FEF7E7]"
                          onClick={() => setViewBooking(booking)}
                        >
                          View
                        </button>
                      </div>
                      <div className="bg-white border border-[#ece4da] p-2 rounded flex justify-between items-center text-[13px]">
                        <div className="text-center px-2 border-r border-[#ece4da] flex-1">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                            {t("MonksCount")}
                          </p>
                          <p className="font-bold text-[#8b5321]">
                            {booking.monksCount}
                          </p>
                        </div>
                        <div className="text-center px-2 border-r border-[#ece4da] flex-1">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                            {t("GuestsCount")}
                          </p>
                          <p className="font-bold text-[#8b5321]">
                            {booking.guestsCount}
                          </p>
                        </div>
                        <div className="text-center px-2 flex-1">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                            {t("Total")}
                          </p>
                          <p className="font-bold text-green-700 text-sm">
                            {booking.totalCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 mt-2 space-y-0.5 border-t border-gray-100 pt-2">
                      <p>
                        Created by:{" "}
                        <strong>
                          {booking.createdByUser?.name || "System"}
                        </strong>{" "}
                        •{" "}
                        {format(
                          new Date(booking.createdAt || Date.now()),
                          "MMM d, yyyy h:mm a",
                        )}
                      </p>
                      {booking.updatedByUser && (
                        <p>
                          Last edited by:{" "}
                          <strong>{booking.updatedByUser.name}</strong>
                        </p>
                      )}
                    </div>

                    {canEditBooking && booking.status !== "COMPLETED" && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
                          onClick={() => handleComplete(booking.id)}
                        >
                          {t("MarkCompleted")}
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition shadow-sm"
                          onClick={() => setEditingBooking(booking)}
                        >
                          {t("Edit")}
                        </button>
                        <button
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition shadow-sm"
                          onClick={() => handleCancel(booking.id)}
                        >
                          {t("CancelBooking")}
                        </button>
                      </div>
                    )}

                    {user?.role === "SUPER_ADMIN" &&
                      booking.status !== "COMPLETED" &&
                      floorBooking &&
                      floorBooking.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleSwap(meal.type)}
                          className="mt-3 w-full flex justify-center items-center gap-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-sm font-bold transition shadow-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="16 3 21 3 21 8"></polyline>
                            <line x1="4" y1="14" x2="21" y2="3"></line>
                            <polyline points="8 21 3 21 3 16"></polyline>
                            <line x1="20" y1="10" x2="3" y2="21"></line>
                          </svg>
                          Swap with First Floor
                        </button>
                      )}

                    {/* PDF DOWNLOAD BUTTON */}
                    <button
                      onClick={() => generatePDF(booking)}
                      className="mt-2 w-full flex justify-center items-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold transition shadow-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      {t("DownloadSlip")}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[15px] font-medium text-gray-700 mb-4">
                      {t("ServiceAvailableDesc")}
                    </p>
                    {canEditBooking &&
                      allowedScreens.includes("NEW_BOOKING") && (
                        <button
                          className="px-6 py-2.5 bg-[#a36329] hover:bg-[#8b5321] text-white rounded-xl text-sm font-bold transition shadow-sm"
                          onClick={() => navigate("/booking/new")}
                        >
                          {t("BookService")}
                        </button>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- UPCOMING BOOKINGS ---------------- */}
      <div className="space-y-4 pt-4 border-t-2 border-dashed border-[#ece4da]">
        <h2 className="text-[17px] font-bold text-[#4a3b2c]">
          {t("UpcomingBookings")}
        </h2>

        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No upcoming bookings yet.
          </p>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-[#ece4da] shadow-sm overflow-hidden overflow-x-auto w-full max-h-[800px] overflow-y-auto">
              <table className="w-full text-left border-collapse relative text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr className="border-b border-[#ece4da]">
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("Date")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("MealType")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("SponsorName")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("Counts")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Extras
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t("Status")}
                    </th>
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece4da]">
                  {paginatedUpcoming.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-bold text-[#3d2f23]">
                          {format(new Date(b.date), "dd MMM yyyy")}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-bold text-[#99582a]">
                          {t(
                            b.mealType === "BALBHOG"
                              ? "Balbhog"
                              : b.mealType === "RAJBHOG"
                                ? "Rajbhog"
                                : b.mealType === "RAJBHOG_FIRST_FLOOR"
                                  ? "RajbhogFF"
                                  : b.mealType === "SAYANKALIN_FIRST_FLOOR"
                                    ? "SayankalinFF"
                                    : "Sayankalin",
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-gray-800">
                          {b.sponsorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {b.mobileNumber}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-[11px] text-gray-500 font-medium space-x-2">
                          <span>
                            M:{" "}
                            <strong className="text-gray-800">
                              {b.monksCount}
                            </strong>
                          </span>
                          <span>
                            G:{" "}
                            <strong className="text-gray-800">
                              {b.guestsCount}
                            </strong>
                          </span>
                          <span>
                            T:{" "}
                            <strong className="text-green-700">
                              {b.totalCount}
                            </strong>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {b.waiters > 0 && (
                            <span
                              className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold"
                              title="Waiters"
                            >
                              W: {b.waiters}
                            </span>
                          )}
                          {b.valetParking > 0 && (
                            <span
                              className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold"
                              title="Valet"
                            >
                              V: {b.valetParking}
                            </span>
                          )}
                          {b.coolers > 0 && (
                            <span
                              className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold"
                              title="Coolers"
                            >
                              C: {b.coolers}
                            </span>
                          )}
                          {b.guards > 0 && (
                            <span
                              className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold"
                              title="Guards"
                            >
                              G: {b.guards}
                            </span>
                          )}
                          {b.masalchis > 0 && (
                            <span
                              className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold"
                              title="Masalchis"
                            >
                              M: {b.masalchis}
                            </span>
                          )}
                          {!b.waiters &&
                            !b.valetParking &&
                            !b.coolers &&
                            !b.guards &&
                            !b.masalchis && (
                              <span className="text-gray-400 font-medium">
                                -
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === "PENDING_CONFIRMATION"
                              ? "bg-yellow-100 text-yellow-700"
                              : b.status === "BOOKED"
                                ? "bg-blue-100 text-blue-700"
                                : b.status === "CONFIRMED"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : b.status === "IN_PROGRESS"
                                    ? "bg-purple-100 text-purple-700"
                                    : b.status === "COMPLETED"
                                      ? "bg-green-100 text-green-700"
                                      : b.status === "CANCELLED"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t(
                            b.status.charAt(0) +
                              b.status.slice(1).toLowerCase(),
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewBooking(b)}
                            className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-xs font-bold border border-gray-200 transition-colors"
                          >
                            View
                          </button>
                          {canEditBooking && b.status !== "COMPLETED" && (
                            <>
                              <button
                                onClick={() => setEditingBooking(b)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-bold border border-blue-200 transition-colors"
                              >
                                {t("Edit")}
                              </button>
                              <button
                                onClick={() => handleCancel(b.id)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold border border-red-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => generatePDF(b)}
                            className="px-2 py-1 bg-[#fdf5e6] hover:bg-[#f5e3cd] text-[#99582a] rounded text-xs font-bold border border-[#f5e3cd] transition-colors flex items-center gap-1"
                            title={t("DownloadSlip")}
                          >
                            Slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {upcomingBookings.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-dashed border-[#ece4da]">
                <div className="text-sm font-bold text-gray-500">
                  Showing {(upcomingPage - 1) * upcomingLimit + 1} to{" "}
                  {Math.min(
                    upcomingPage * upcomingLimit,
                    upcomingBookings.length,
                  )}{" "}
                  of {upcomingBookings.length}
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={upcomingLimit}
                    onChange={(e) => {
                      setUpcomingLimit(Number(e.target.value));
                      setUpcomingPage(1);
                    }}
                    className="p-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#99582a] outline-none"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      disabled={upcomingPage === 1}
                      onClick={() => setUpcomingPage((p) => p - 1)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={
                        upcomingPage * upcomingLimit >= upcomingBookings.length
                      }
                      onClick={() => setUpcomingPage((p) => p + 1)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={() => {
            setEditingBooking(null);
            fetchBookings();
          }}
        />
      )}
      {viewBooking && (
        <ViewBookingModal
          booking={viewBooking}
          onClose={() => setViewBooking(null)}
        />
      )}
    </div>
  );
}
