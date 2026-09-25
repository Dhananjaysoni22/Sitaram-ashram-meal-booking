import React from "react";
import { format, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";
import { Eye, Edit2, Download } from "lucide-react";
import { generateBookingPDF } from "../utils/pdfGenerator";

export default function DayBookingsModal({
  date,
  bookings,
  festivals,
  onClose,
  onViewBooking,
  onEditBooking,
}: any) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const generatePDF = (booking: any) => {
    generateBookingPDF(booking, t);
  };

  const mealOrder: Record<string, number> = {
    BALBHOG: 1,
    RAJBHOG: 2,
    RAJBHOG_FIRST_FLOOR: 3,
    SAYANKALIN: 4,
    SAYANKALIN_FIRST_FLOOR: 5,
  };

  const sortedBookings = [...bookings].sort((a: any, b: any) => {
    return (mealOrder[a.mealType] || 99) - (mealOrder[b.mealType] || 99);
  });

  const getMealDisplayName = (mealType: string) => {
    if (mealType === "BALBHOG") return t("Balbhog");
    if (mealType === "RAJBHOG") return t("Rajbhog");
    if (mealType === "SAYANKALIN") return t("Sayankalin");
    if (mealType === "RAJBHOG_FIRST_FLOOR") return t("RajbhogFF");
    if (mealType === "SAYANKALIN_FIRST_FLOOR") return t("SayankalinFF");
    return mealType;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-[#ece4da] bg-[#fef7e7] rounded-t-2xl shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[#4a3b2c]">
              {format(date, "dd MMMM yyyy")}
            </h3>
            {festivals.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {festivals.map((f: any, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#faf8f5] flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">
                No bookings on this day.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-[#ece4da] p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-bold text-[#99582a] bg-[#fef7e7] px-2.5 py-1 rounded-md text-sm inline-block mb-2">
                        {getMealDisplayName(booking.mealType)}
                      </span>
                      <h4 className="font-bold text-gray-800 text-lg">
                        {booking.sponsorName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Mobile:</span>{" "}
                        {booking.mobileNumber}
                        {booking.alternateNumber &&
                          `, ${booking.alternateNumber}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">City:</span>{" "}
                        {booking.cityLocation}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm ${
                        booking.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : booking.status === "CANCELLED"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {booking.status === "COMPLETED"
                        ? t("Completed")
                        : booking.status === "CANCELLED"
                          ? t("Cancelled")
                          : t("Booked")}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => onViewBooking(booking)}
                      className="flex-1 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye size={16} />
                      {t("View")}
                    </button>
                    {onEditBooking &&
                      booking.status !== "CANCELLED" &&
                      booking.status !== "COMPLETED" &&
                      (user?.role === "SUPER_ADMIN" ||
                        (user?.role === "BOOKING_COORDINATOR" &&
                          new Date(booking.date) >=
                            startOfDay(new Date()))) && (
                        <button
                          onClick={() => onEditBooking(booking)}
                          className="flex-1 py-2.5 text-sm font-bold bg-[#fef7e7] text-[#99582a] border border-[#f5e3cd] rounded-lg hover:bg-[#f5e3cd] shadow-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <Edit2 size={16} />
                          {t("Edit")}
                        </button>
                      )}
                    <button
                      onClick={() => generatePDF(booking)}
                      className="flex-1 py-2.5 text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={16} />
                      {t("DownloadSlip")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
