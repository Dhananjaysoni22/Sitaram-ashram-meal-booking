import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { newBooking, getAllBookings, type Booking } from "../api/booking.api";
import { getOccasions } from "../api/setup.api";
import { getDateFestivals } from "../api/calendar.api";
import { Calendar, Users, MapPin, Phone, User, FileText, CheckCircle, IndianRupee } from "lucide-react";
import Editor from "react-simple-wysiwyg";

export default function NewBooking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [setupOccasions, setSetupOccasions] = useState<any[]>([]);
  const [dateFestivals, setDateFestivals] = useState<any[]>([]);

  useEffect(() => {
    getAllBookings()
      .then((res) => setBookings(res.data))
      .catch(console.error);
      
    getOccasions()
      .then((res) => setSetupOccasions(res.data.data))
      .catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    date: "",
    mealType: "BALBHOG",
    sponsorName: "",
    mobileNumber: "",
    alternateNumber: "",
    cityLocation: "",
    occasion: "",
    monksCount: 0,
    guestsCount: 0,
    specialInstructions: "",
    advanceAmount: "",
      paymentMethod: "",
    costPerHead: "",
    valetParking: 0,
    waiters: 0,
    coolers: 0,
    guards: 0,
    masalchis: 0,
    totalPayment: "",
  });

  // Helper to check if a specific meal on the selected date is already booked
  const isMealBooked = (mealType: string) => {
    if (!formData.date) return false;
    return bookings.some(
      (b) =>
        b.mealType === mealType &&
        new Date(b.date).toDateString() ===
          new Date(formData.date).toDateString() &&
        b.status !== "CANCELLED",
    );
  };

  useEffect(() => {
    if (formData.date) {
      getDateFestivals(formData.date)
        .then(res => setDateFestivals(res.data.data))
        .catch(console.error);
    } else {
      setDateFestivals([]);
    }
  }, [formData.date]);

  // Auto-switch mealType if the selected one is booked
  useEffect(() => {
    if (formData.date && isMealBooked(formData.mealType)) {
      const available = [
        "BALBHOG", 
        "RAJBHOG", 
        "SAYANKALIN", 
        "RAJBHOG_FIRST_FLOOR", 
        "SAYANKALIN_FIRST_FLOOR"
      ].find((m) => !isMealBooked(m));
      if (available) {
        setFormData((prev) => ({ ...prev, mealType: available }));
      }
    }
  }, [formData.date, bookings]);

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Omit<Booking, "id" | "status"> = {
        ...formData,
        mealType: formData.mealType as any,
        monksCount: Number(formData.monksCount),
        guestsCount: Number(formData.guestsCount),
        totalCount: Number(formData.monksCount) + Number(formData.guestsCount),
        coSponsors: "",
        advanceAmount: formData.advanceAmount ? Number(formData.advanceAmount) : undefined,
        costPerHead: formData.costPerHead ? Number(formData.costPerHead) : undefined,
        valetParking: formData.valetParking ? Number(formData.valetParking) : undefined,
        waiters: formData.waiters ? Number(formData.waiters) : undefined,
        coolers: formData.coolers ? Number(formData.coolers) : undefined,
        guards: formData.guards ? Number(formData.guards) : undefined,
        masalchis: formData.masalchis ? Number(formData.masalchis) : undefined,
        totalPayment: formData.totalPayment ? Number(formData.totalPayment) : undefined,
      };
      await newBooking(payload);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-[#e6d9c9] focus:border-[#99582a] focus:ring focus:ring-[#99582a]/20 rounded-xl px-4 py-3 text-sm transition-all outline-none text-[#333]";
  const labelClass = "block text-[13px] font-bold text-[#8a7662] mb-1.5 ml-1";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#fef7e7] border border-[#f5e3cd] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4a3b2c] mb-1">
            {t("NewBookingTitle")}
          </h2>
          <p className="text-sm font-medium text-[#8a7662]">
            {t("NewBookingSub")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
        >
          {/* Left Column: Basic Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("Date")}</label>
                <input
                  type="date"
                  name="date"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
                {dateFestivals.length > 0 && (
                  <div className="mt-2 text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-1.5 rounded-lg border border-purple-200">
                    <span className="mr-1">🕉️</span> 
                    {dateFestivals.map(f => f.name).join(", ")}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>{t("MealType")}</label>
                <select
                  name="mealType"
                  onChange={handleChange}
                  className={inputClass}
                  value={formData.mealType}
                >
                  <option value="BALBHOG" disabled={isMealBooked("BALBHOG")}>
                    {t("Balbhog")} {isMealBooked("BALBHOG") ? `(${t("Booked")})` : ""}
                  </option>
                  <option value="RAJBHOG" disabled={isMealBooked("RAJBHOG")}>
                    {t("Rajbhog")} {isMealBooked("RAJBHOG") ? `(${t("Booked")})` : ""}
                  </option>
                  <option value="SAYANKALIN" disabled={isMealBooked("SAYANKALIN")}>
                    {t("Sayankalin")} {isMealBooked("SAYANKALIN") ? `(${t("Booked")})` : ""}
                  </option>
                  <option value="RAJBHOG_FIRST_FLOOR" disabled={isMealBooked("RAJBHOG_FIRST_FLOOR")}>
                    {t("RajbhogFF")} {isMealBooked("RAJBHOG_FIRST_FLOOR") ? `(${t("Booked")})` : ""}
                  </option>
                  <option value="SAYANKALIN_FIRST_FLOOR" disabled={isMealBooked("SAYANKALIN_FIRST_FLOOR")}>
                    {t("SayankalinFF")} {isMealBooked("SAYANKALIN_FIRST_FLOOR") ? `(${t("Booked")})` : ""}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("SponsorName")}</label>
              <input
                type="text"
                name="sponsorName"
                required
                placeholder={t("ExName")}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t("MobileNumber")}</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  placeholder={t("ExMobile")}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Alternate Number</label>
                <input
                  type="tel"
                  name="alternateNumber"
                  placeholder="Optional"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("City")}</label>
                <input
                  type="text"
                  name="cityLocation"
                  required
                  placeholder={t("ExCity")}
                  onChange={handleChange}
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
                  placeholder={t("ExAdvanceAmount")}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("CostPerHead")}</label>
                <input
                  type="number"
                  name="costPerHead"
                  placeholder={t("ExCostPerHead")}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("PaymentMethod")}</label>
                <select
                  name="paymentMethod"
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">{t("Select")}</option>
                  <option value="Cash">{t("Cash")}</option>
                  <option value="UPI">{t("UPI")}</option>
                  <option value="Cheque">{t("Cheque")}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("TotalPayment")}</label>
              <input
                type="number"
                name="totalPayment"
                placeholder={t("ExTotalPayment")}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Right Column: Occasion, Headcount, Menu, Services */}
          <div className="space-y-6">
            <div>
              <label className={labelClass}>{t("OccasionLabel")}</label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- {t("SelectOccasion")} --</option>
                {setupOccasions.map(occ => (
                  <option key={occ.id} value={occ.name}>{occ.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-dashed border-[#ece4da] pt-6 md:border-t-0 md:pt-0">
              <div>
                <label className={labelClass}>{t("MonksCount")}</label>
                <input
                  type="number"
                  name="monksCount"
                  min="0"
                  defaultValue={0}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("GuestsCount")}</label>
                <input
                  type="number"
                  name="guestsCount"
                  min="0"
                  defaultValue={0}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-dashed border-[#ece4da] pt-6">
              <label className="block text-[13px] font-bold text-[#8a7662] mb-3 ml-1">{t("ExtraServices")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">{t("ValetParking")}</label>
                  <input type="number" name="valetParking" min="0" defaultValue={0} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">{t("Waiters")}</label>
                  <input type="number" name="waiters" min="0" defaultValue={0} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">{t("Coolers")}</label>
                  <input type="number" name="coolers" min="0" defaultValue={0} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">{t("Guards")}</label>
                  <input type="number" name="guards" min="0" defaultValue={0} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">{t("Masalchis")}</label>
                  <input type="number" name="masalchis" min="0" defaultValue={0} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className={labelClass}>{t("MenuLabel")}</label>
              <div className="w-full bg-gray-50 border border-[#e6d9c9] focus-within:border-[#99582a] focus-within:ring focus-within:ring-[#99582a]/20 rounded-xl overflow-hidden transition-all text-[#333] prose prose-sm max-w-none">
                <Editor
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  containerProps={{ style: { minHeight: '300px', border: 'none', padding: '12px' } }}
                />
              </div>
            </div>
          </div>

          {/* Full Width Submit */}
          <div className="md:col-span-2 pt-4 mt-2 border-t border-[#ece4da]">
            <button
              type="submit"
              className="w-full md:w-auto md:px-12 py-3.5 bg-[#a36329] hover:bg-[#8b5321] text-white rounded-xl text-base font-bold transition shadow-md md:float-right"
            >
              {t("SaveBooking")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
