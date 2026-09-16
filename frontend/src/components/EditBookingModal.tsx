import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { getOccasions } from "../api/setup.api";
import { getDateFestivals } from "../api/calendar.api";
import Editor from "react-simple-wysiwyg";

export default function EditBookingModal({
  booking,
  onClose,
  onSave,
}: {
  booking: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [setupOccasions, setSetupOccasions] = useState<any[]>([]);
  const [dateFestivals, setDateFestivals] = useState<any[]>([]);

  useEffect(() => {
    getOccasions().then(res => setSetupOccasions(res.data.data)).catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    date: "",
    mealType: "BALBHOG",
    sponsorName: "",
    mobileNumber: "",
    cityLocation: "",
    occasion: "",
    monksCount: 0,
    guestsCount: 0,
    specialInstructions: "",
    advanceAmount: "",
    costPerHead: "",
    valetParking: 0,
    waiters: 0,
    coolers: 0,
    guards: 0,
    masalchis: 0,
    totalPayment: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (booking) {
      setFormData({
        date: format(new Date(booking.date), "yyyy-MM-dd"),
        mealType: booking.mealType,
        sponsorName: booking.sponsorName || "",
        mobileNumber: booking.mobileNumber || "",
        cityLocation: booking.cityLocation || "",
        occasion: booking.occasion || "",
        monksCount: booking.monksCount || 0,
        guestsCount: booking.guestsCount || 0,
        specialInstructions: booking.specialInstructions || "",
        advanceAmount: booking.advanceAmount || "",
        costPerHead: booking.costPerHead || "",
        valetParking: booking.valetParking || 0,
        waiters: booking.waiters || 0,
        coolers: booking.coolers || 0,
        guards: booking.guards || 0,
        masalchis: booking.masalchis || 0,
        totalPayment: booking.totalPayment || "",
      });
    }
  }, [booking]);

  useEffect(() => {
    if (formData.date) {
      getDateFestivals(formData.date)
        .then(res => setDateFestivals(res.data.data))
        .catch(console.error);
    } else {
      setDateFestivals([]);
    }
  }, [formData.date]);

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
      await axiosClient.patch(`/bookings/${booking.id}`, {
        ...formData,
        monksCount: Number(formData.monksCount),
        guestsCount: Number(formData.guestsCount),
        advanceAmount: Number(formData.advanceAmount),
        costPerHead: Number(formData.costPerHead),
      });
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update booking");
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-[#e6d9c9] focus:border-[#99582a] focus:ring focus:ring-[#99582a]/20 rounded-xl px-4 py-2.5 text-sm transition-all outline-none text-[#333]";
  const labelClass = "block text-[12px] font-bold text-[#8a7662] mb-1 ml-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-[#ece4da] bg-[#fef7e7] rounded-t-2xl shrink-0">
          <h3 className="text-xl font-bold text-[#4a3b2c]">
            {t("EditBooking")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("Date")}</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
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
                  value={formData.mealType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="BALBHOG">{t("Balbhog")}</option>
                  <option value="RAJBHOG">{t("Rajbhog")}</option>
                  <option value="SAYANKALIN">{t("Sayankalin")}</option>
                  <option value="RAJBHOG_FIRST_FLOOR">{t("RajbhogFF")}</option>
                  <option value="SAYANKALIN_FIRST_FLOOR">{t("SayankalinFF")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("SponsorName")}</label>
                <input
                  type="text"
                  name="sponsorName"
                  required
                  value={formData.sponsorName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("MobileNumber")}</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
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
                  required
                  value={formData.cityLocation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("MonksCount")}</label>
                <input
                  type="number"
                  name="monksCount"
                  min="0"
                  value={formData.monksCount}
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
                  value={formData.guestsCount}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("AdvanceAmount")}</label>
                <input
                  type="number"
                  name="advanceAmount"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  disabled={user?.role !== "SUPER_ADMIN" && booking.advanceAmount > 0}
                  className={`${inputClass} ${user?.role !== "SUPER_ADMIN" && booking.advanceAmount > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={user?.role !== "SUPER_ADMIN" && booking.advanceAmount > 0 ? "Only Admin can edit Advance Amount once paid." : ""}
                />
              </div>
              <div>
                <label className={labelClass}>{t("CostPerHead")}</label>
                <input
                  type="number"
                  name="costPerHead"
                  value={formData.costPerHead}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>{t("TotalPayment")}</label>
              <input
                type="number"
                name="totalPayment"
                value={formData.totalPayment}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            
            <div className="border-t border-dashed border-[#ece4da] pt-4">
              <label className={labelClass}>{t("ExtraServices")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("ValetParking")}</label>
                  <input type="number" name="valetParking" min="0" value={formData.valetParking} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Waiters")}</label>
                  <input type="number" name="waiters" min="0" value={formData.waiters} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Coolers")}</label>
                  <input type="number" name="coolers" min="0" value={formData.coolers} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Guards")}</label>
                  <input type="number" name="guards" min="0" value={formData.guards} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">{t("Masalchis")}</label>
                  <input type="number" name="masalchis" min="0" value={formData.masalchis} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("MenuLabel")}</label>
              <div className="w-full bg-gray-50 border border-[#e6d9c9] focus-within:border-[#99582a] focus-within:ring focus-within:ring-[#99582a]/20 rounded-xl overflow-hidden transition-all text-[#333] prose prose-sm max-w-none">
                <Editor
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  containerProps={{ style: { minHeight: '300px', border: 'none', padding: '12px' } }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#ece4da]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#99582a] hover:bg-[#8b5321] text-white rounded-xl font-bold transition"
              >
                {t("SaveChanges")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
