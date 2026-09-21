
import React from "react";
import { format, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";
import { Eye, Edit2, Download } from "lucide-react";

export default function DayBookingsModal({ 
  date, 
  bookings, 
  festivals, 
  onClose,
  onViewBooking,
  onEditBooking
}: any) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const generatePDF = (booking: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(153, 88, 42); 
    doc.text(t("KitchenSlipTitle").toUpperCase(), 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);

    const formattedDate = format(new Date(booking.date), "dd MMMM yyyy");
    doc.text(`Date: ${formattedDate}`, 20, 40);
    doc.text(`Meal Type: ${booking.mealType}`, 120, 40);

    doc.text(`Bhakt Name: ${booking.sponsorName}`, 20, 50);
    const mobileStr = booking.alternateNumber 
      ? `Mobile: ${booking.mobileNumber}, ${booking.alternateNumber}`
      : `Mobile: ${booking.mobileNumber}`;
    doc.text(mobileStr, 120, 50);

    doc.text(`City: ${booking.cityLocation}`, 20, 60);
    doc.text(`Occasion: ${booking.occasion || "-"}`, 120, 60);

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

      const ols = tmp.querySelectorAll("ol");
      ols.forEach((ol) => {
        const lis = Array.from(ol.children).filter((el) => el.tagName === "LI");
        lis.forEach((li, index) => {
          li.prepend(document.createTextNode(`${index + 1}. `));
        });
      });

      const uls = tmp.querySelectorAll("ul");
      uls.forEach((ul) => {
        const lis = Array.from(ul.children).filter((el) => el.tagName === "LI");
        lis.forEach((li) => {
          li.prepend(document.createTextNode(`• `));
        });
      });

      const blocks = tmp.querySelectorAll("p, div, br, li");
      blocks.forEach((block) => {
        if (block.tagName === "BR") {
          block.replaceWith(document.createTextNode("\n"));
        }
      });

      let text = tmp.innerText || "";
      document.body.removeChild(tmp);
      return text.replace(/\n\n+/g, "\n").trim();
    };
    const menuText = doc.splitTextToSize(
      stripHtml(booking.specialInstructions || "") ||
        "No special instructions provided.",
      170,
    );
    doc.text(menuText, 20, currentY);

    const safeName = (booking.sponsorName || "Unknown").replace(
      /[^a-zA-Z0-9]/g,
      "_",
    );
    const fileDate = format(new Date(booking.date), "dd-MMM-yyyy");
    doc.save(`Kitchen-Slip-${safeName}-${booking.mealType}-${fileDate}.pdf`);
  };

  const getMealDisplayName = (mealType: string) => {
    if (mealType === "BALBHOG") return t("Balbhog");
    if (mealType === "RAJBHOG") return t("Rajbhog");
    if (mealType === "SAYANKALIN") return t("Sayankalin");
    if (mealType === "RAJBHOG_FIRST_FLOOR") return t("RajbhogFF");
    if (mealType === "SAYANKALIN_FIRST_FLOOR") return t("SayankalinFF");
    return mealType;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={onClose}>
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
                  <span key={i} className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                    ?? {f.name}
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
              <p className="text-gray-500 font-medium">No bookings on this day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-[#ece4da] p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-bold text-[#99582a] bg-[#fef7e7] px-2.5 py-1 rounded-md text-sm inline-block mb-2">
                        {getMealDisplayName(booking.mealType)}
                      </span>
                      <h4 className="font-bold text-gray-800 text-lg">{booking.sponsorName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Mobile:</span> {booking.mobileNumber} 
                        {booking.alternateNumber && `, ${booking.alternateNumber}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">City:</span> {booking.cityLocation}
                      </p>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm ${
                        booking.status === "COMPLETED" ? "bg-green-100 text-green-700 border border-green-200" :
                        booking.status === "CANCELLED" ? "bg-red-100 text-red-700 border border-red-200" :
                        "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}>
                        {booking.status === "COMPLETED" ? t("Completed") : 
                         booking.status === "CANCELLED" ? t("Cancelled") : 
                         t("Booked")}
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
                     (user?.role === "SUPER_ADMIN" || user?.role === "BOOKING_COORDINATOR") && 
                     new Date(booking.date) >= startOfDay(new Date()) && (
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





