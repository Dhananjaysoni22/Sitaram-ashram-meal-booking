import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Calendar, IndianRupee, Clock, CheckCircle } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { format, getDaysInMonth, startOfMonth, addDays } from "date-fns";

interface WorkerProfileModalProps {
  workerId: string;
  onClose: () => void;
}

export default function WorkerProfileModal({ workerId, onClose }: WorkerProfileModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetchHistory();
  }, [workerId, selectedYear, selectedMonth]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/workers/history/${workerId}?year=${selectedYear}&month=${selectedMonth}`);
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!workerId) return null;

  const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  
  const calendarDays = Array.from({ length: daysInMonth }).map((_, i) => {
    const date = addDays(monthStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const att = data?.attendances.find((a: any) => format(new Date(a.date), "yyyy-MM-dd") === dateStr);
    return { date, att };
  });

  const totalPaid = data?.payments.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
  const daysPresent = data?.attendances.filter((a: any) => a.isPresent).length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#99582a] to-[#804a23] text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{data?.worker?.name || "Worker Profile"}</h2>
            <div className="flex gap-4 mt-2 text-white/80 text-sm font-medium">
              <span>{data?.worker?.category || "No Category"}</span>
              <span>•</span>
              <span>{t(data?.worker?.wageType)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-[#ece4da] bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-2.5 rounded-xl border-2 border-gray-200 focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {format(new Date(2000, i, 1), "MMMM")}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2.5 rounded-xl border-2 border-gray-200 focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm"
            >
              {[2023, 2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-6 text-[#99582a]">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <div>
                <p className="text-xs text-gray-500 font-bold">{t("DaysPresent")}</p>
                <p className="text-lg font-black leading-none">{daysPresent}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee size={20} />
              <div>
                <p className="text-xs text-gray-500 font-bold">{t("TotalPaid")}</p>
                <p className="text-lg font-black leading-none">₹{totalPaid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#99582a]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Calendar Section */}
              <div>
                <h3 className="text-lg font-bold text-[#3d2f23] mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-[#99582a]" />
                  Attendance Calendar
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                  ))}
                  
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                  ))}
                  
                  {calendarDays.map(({ date, att }, i) => {
                    const isPresent = att?.isPresent;
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-default ${
                          isPresent === true ? 'bg-green-50 border-green-500 text-green-700' : 
                          isPresent === false ? 'bg-red-50 border-red-500 text-red-700' : 
                          'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        <span className="font-bold">{format(date, "d")}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex gap-4 mt-6 justify-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><div className="w-3 h-3 rounded-full bg-green-500"></div> Present</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><div className="w-3 h-3 rounded-full bg-gray-200"></div> Not Marked</div>
                </div>
              </div>

              {/* Payments Section */}
              <div>
                <h3 className="text-lg font-bold text-[#3d2f23] mb-4 flex items-center gap-2">
                  <IndianRupee size={20} className="text-[#99582a]" />
                  Payment Ledger
                </h3>
                {data?.payments?.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold">
                    No payments this month
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data?.payments.map((p: any) => (
                      <div key={p.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#3d2f23]">{format(new Date(p.paymentDate), "dd MMM yyyy")}</p>
                          {p.notes && <p className="text-sm text-gray-500">{p.notes}</p>}
                        </div>
                        <div className="text-lg font-black text-green-600">
                          ₹{p.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
