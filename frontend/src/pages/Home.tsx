import React, { useEffect, useState } from "react";
import { format, isAfter, startOfDay } from "date-fns";
import { hi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import { getAllBookings, updateBookingStatus } from "../api/booking.api";
import EditBookingModal from "../components/EditBookingModal";
import { useNavigate } from "react-router-dom";
import ViewBookingModal from "../components/ViewBookingModal";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, allowedScreens } = useAuth();
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [viewBooking, setViewBooking] = useState<any>(null);
  const today = new Date();
  const navigate = useNavigate();
  const canEditBooking = user?.role === 'SUPER_ADMIN' || user?.role === 'BOOKING_COORDINATOR';

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
    const doc = new jsPDF();

    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(153, 88, 42); // Brown color
    doc.text(t("KitchenSlipTitle").toUpperCase(), 105, 20, { align: "center" });

    // Add Details
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);

    const formattedDate = format(new Date(booking.date), "dd MMMM yyyy");
    doc.text(`Date: ${formattedDate}`, 20, 40);
    doc.text(`Meal Type: ${booking.mealType}`, 120, 40);

    doc.text(`Bhakt Name: ${booking.sponsorName}`, 20, 50);
    doc.text(`Mobile: ${booking.mobileNumber}`, 120, 50);

    doc.text(`City: ${booking.cityLocation}`, 20, 60);
    doc.text(`Occasion: ${booking.occasion || "-"}`, 120, 60);

    // Headcounts box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 70, 170, 15);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Monks: ${booking.monksCount}    |    Guests: ${booking.guestsCount}    |    TOTAL: ${booking.totalCount}`,
      25,
      80,
    );

    let currentY = 95;

    const extras = [];
    if (booking.valetParking) extras.push(`Valet: ${booking.valetParking}`);
    if (booking.waiters) extras.push(`Waiters: ${booking.waiters}`);
    if (booking.coolers) extras.push(`Coolers: ${booking.coolers}`);
    if (booking.guards) extras.push(`Guards: ${booking.guards}`);
    if (booking.masalchis) extras.push(`Masalchis: ${booking.masalchis}`);

    if (extras.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text(`Extras: ${extras.join("  |  ")}`, 20, currentY);
      currentY += 15;
    }

    // Menu / Instructions
    doc.setFont("helvetica", "bold");
    doc.text("Meal Menu / Special Instructions:", 20, currentY);
    currentY += 10;

    doc.setFont("helvetica", "normal");
    const stripHtml = (html: string) => {
      const tmp = document.createElement("div");
      tmp.style.position = "absolute";
      tmp.style.left = "-9999px";
      tmp.style.width = "1000px";
      tmp.innerHTML = html;
      document.body.appendChild(tmp);
      
      // Manually inject numbers for ordered lists (bypasses Tailwind list resets)
      const ols = tmp.querySelectorAll('ol');
      ols.forEach(ol => {
        const lis = Array.from(ol.children).filter(el => el.tagName === 'LI');
        lis.forEach((li, index) => {
          li.prepend(document.createTextNode(`${index + 1}. `));
        });
      });

      // Manually inject bullets for unordered lists
      const uls = tmp.querySelectorAll('ul');
      uls.forEach(ul => {
        const lis = Array.from(ul.children).filter(el => el.tagName === 'LI');
        lis.forEach(li => {
          li.prepend(document.createTextNode(`• `));
        });
      });

      // Also force block elements to have newlines in case innerText misses some
      const blocks = tmp.querySelectorAll('p, div, br, li');
      blocks.forEach(block => {
        if (block.tagName === 'BR') {
           block.replaceWith(document.createTextNode('\n'));
        }
      });

      let text = tmp.innerText || "";
      document.body.removeChild(tmp);
      return text.replace(/\n\n+/g, "\n").trim();
    };
    const menuText = doc.splitTextToSize(
      stripHtml(booking.specialInstructions || "") || "No special instructions provided.",
      170,
    );
    doc.text(menuText, 20, currentY);

    const safeName = (booking.sponsorName || "Unknown").replace(/[^a-zA-Z0-9]/g, '_');
    const fileDate = format(new Date(booking.date), "dd-MMM-yyyy");
    doc.save(`Kitchen-Slip-${safeName}-${booking.mealType}-${fileDate}.pdf`);
  };

  const meals = [
    { type: "BALBHOG", name: t("Balbhog"), subtitle: t("BalbhogDesc") },
    { type: "RAJBHOG", name: t("Rajbhog"), subtitle: t("RajbhogDesc") },
    {
      type: "SAYANKALIN",
      name: t("Sayankalin"),
      subtitle: t("SayankalinDesc"),
    },
    { type: "RAJBHOG_FIRST_FLOOR", name: t("RajbhogFF"), subtitle: t("RajbhogFFDesc") },
    { type: "SAYANKALIN_FIRST_FLOOR", name: t("SayankalinFF"), subtitle: t("SayankalinFFDesc") },
  ];

  const upcomingBookings = bookings
    .filter(
      (b) =>
        isAfter(startOfDay(new Date(b.date)), startOfDay(today)) &&
        b.status !== "CANCELLED",
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                        <p onClick={() => setViewBooking(booking)}>View</p>
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
                      <p>Created by: <strong>{booking.createdByUser?.name || "System"}</strong> • {format(new Date(booking.createdAt || Date.now()), "MMM d, yyyy h:mm a")}</p>
                      {booking.updatedByUser && (
                        <p>Last edited by: <strong>{booking.updatedByUser.name}</strong></p>
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
                    {canEditBooking && allowedScreens.includes("NEW_BOOKING") && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow-sm border border-[#ece4da] p-4 flex flex-col justify-between gap-4 h-full"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-[#99582a] bg-[#fef7e7] px-2 py-0.5 rounded text-sm">
                      {format(new Date(b.date), "dd MMM")}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {b.mealType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[14px] text-gray-800 mb-2">
                      <strong>{b.sponsorName}</strong>
                    </p>
                    <p onClick={() => setViewBooking(b)}>View</p>
                  </div>

                  <div className="text-[11px] text-gray-500 font-medium bg-gray-50 p-2 rounded border border-gray-100 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      {t("MonksCount")}:{" "}
                      <strong className="text-gray-800">{b.monksCount}</strong>
                    </span>
                    <span>
                      {t("GuestsCount")}:{" "}
                      <strong className="text-gray-800">{b.guestsCount}</strong>
                    </span>
                    <span>
                      {t("Total")}:{" "}
                      <strong className="text-green-700">{b.totalCount}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 space-y-0.5 border-t border-gray-100 pt-2">
                  <p>Created by: <strong>{b.createdByUser?.name || "System"}</strong> • {format(new Date(b.createdAt || Date.now()), "MMM d, yyyy h:mm a")}</p>
                  {b.updatedByUser && (
                    <p>Last edited by: <strong>{b.updatedByUser.name}</strong></p>
                  )}
                </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    {canEditBooking && b.status !== "COMPLETED" && (
                      <>
                        <button
                          onClick={() => setEditingBooking(b)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition"
                        >
                          {t("Edit")}
                        </button>
                        <button
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition shadow-sm"
                          onClick={() => handleCancel(b.id)}
                        >
                          {t("CancelBooking")}
                        </button>
                      </>
                    )}
                    <button
                    onClick={() => generatePDF(b)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#fdf5e6] hover:bg-[#f5e3cd] text-[#99582a] border border-[#f5e3cd] rounded-lg text-xs font-bold transition mt-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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
              </div>
            ))}
          </div>
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
