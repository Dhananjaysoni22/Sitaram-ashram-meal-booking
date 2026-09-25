import { useTranslation } from "react-i18next";

export default function ViewBookingModal({
  booking,
  onClose,
}: {
  booking: any;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const inputClass =
    "w-full bg-gray-50 border border-[#e6d9c9] focus:border-[#99582a] focus:ring focus:ring-[#99582a]/20 rounded-xl px-4 py-2.5 text-sm transition-all outline-none text-[#333]";
  const labelClass = "block text-[12px] font-bold text-[#8a7662] mb-1 ml-1";
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-[#ece4da] bg-[#fef7e7] rounded-t-2xl shrink-0">
          <h3 className="text-xl font-bold text-[#4a3b2c]">
            {t("ViewBooking")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("Date")}</label>
                <input
                  name="date"
                  required
                  readOnly
                  value={
                    booking.date
                      ? new Date(booking.date).toLocaleDateString("en-GB")
                      : ""
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("MealType")}</label>
                <input
                  name="mealType"
                  readOnly
                  value={
                    booking.mealType === "BALBHOG" ? t("Balbhog") :
                    booking.mealType === "RAJBHOG" ? t("Rajbhog") :
                    booking.mealType === "SAYANKALIN" ? t("Sayankalin") :
                    booking.mealType === "RAJBHOG_FIRST_FLOOR" ? t("RajbhogFF") :
                    t("SayankalinFF")
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t("SponsorName")}</label>
                <input
                  type="text"
                  name="sponsorName"
                  readOnly
                  value={booking.sponsorName}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("MobileNumber")}</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  readOnly
                  value={booking.mobileNumber}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Alternate Number</label>
                <input
                  type="tel"
                  name="alternateNumber"
                  readOnly
                  value={booking.alternateNumber || "-"}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("City")}</label>
                <input
                  type="text"
                  name="cityLocation"
                  readOnly
                  value={booking.cityLocation}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("OccasionLabel")}</label>
                <input
                  type="text"
                  name="occasion"
                  value={booking.occasion}
                  readOnly
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("MonksCount")}</label>
                <input
                  type="number"
                  name="monksCount"
                  readOnly
                  value={booking.monksCount}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("GuestsCount")}</label>
                <input
                  type="number"
                  name="guestsCount"
                  readOnly
                  value={booking.guestsCount}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t("AdvanceAmount")}</label>
                <input
                  type="number"
                  name="advanceAmount"
                  readOnly
                  value={booking.advanceAmount || ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("CostPerHead")}</label>
                <input
                  type="number"
                  name="costPerHead"
                  readOnly
                  value={booking.costPerHead || ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("PaymentMethod")}</label>
                <input
                  type="text"
                  value={booking.paymentMethod ? t(booking.paymentMethod) : ""}
                  readOnly
                  className={inputClass}
                />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>{t("TotalPayment")}</label>
              <input
                type="number"
                name="totalPayment"
                readOnly
                value={booking.totalPayment || ""}
                className={inputClass}
              />
            </div>
            
            <div className="border-t border-dashed border-[#ece4da] pt-4">
              <label className={labelClass}>{t("ExtraServices")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("ValetParking")}</label>
                  <input type="number" readOnly value={booking.valetParking || 0} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Waiters")}</label>
                  <input type="number" readOnly value={booking.waiters || 0} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Coolers")}</label>
                  <input type="number" readOnly value={booking.coolers || 0} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Guards")}</label>
                  <input type="number" readOnly value={booking.guards || 0} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Masalchis")}</label>
                  <input type="number" readOnly value={booking.masalchis || 0} className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("MenuLabel")}</label>
              <div 
                className={`${inputClass} min-h-[250px] overflow-auto prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0`}
                dangerouslySetInnerHTML={{ __html: booking.specialInstructions || "" }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#ece4da]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
