import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMonthlyReport } from "../api/worker.api";
import { format } from "date-fns";
import { Calendar, IndianRupee, Clock, CheckCircle, Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function WorkerReports() {
  const { t } = useTranslation();
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"ASHRAM" | "MANDIR">(location.state?.defaultTab || "ASHRAM");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    getMonthlyReport(year, month, activeTab, page, limit).then(res => {
      setReport(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  }, [year, month, activeTab, page, limit]);

  const monthName = format(new Date(2000, month, 1), "MMMM");

  const exportToExcel = async () => {
    const res = await getMonthlyReport(year, month, activeTab);
    const fullReport = res.data.data;
    const data = fullReport.map((r: any) => ({
      [t("Name")]: r.worker.name,
      [t("Category")]: r.worker.category || "-",
      [t("WageType")]: t(r.worker.wageType),
      [t("WageRate")]: r.worker.wageRate,
      [t("DaysPresent")]: r.daysPresent,
      [t("TotalHours")]: r.totalHours,
      [t("TotalPaid")]: r.totalPaid
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");
    XLSX.writeFile(wb, `Worker_Report_${monthName}_${year}.xlsx`);
  };

  const exportToPDF = async () => {
    const res = await getMonthlyReport(year, month, activeTab);
    const fullReport = res.data.data;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`Worker Monthly Report - ${monthName} ${year}`, 14, 20);
    
    const head = [[t("Name"), t("Category"), t("WageType"), t("WageRate"), t("DaysPresent"), t("TotalHours"), t("TotalPaid")]];
    const body = fullReport.map((r: any) => [
      r.worker.name,
      r.worker.category || "-",
      t(r.worker.wageType),
      r.worker.wageRate,
      r.daysPresent,
      r.totalHours,
      r.totalPaid
    ]);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [153, 88, 42] } // #99582a
    });

    doc.save(`Worker_Report_${monthName}_${year}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#99582a]">{t("WorkerMonthlyReport")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("WorkerReportDesc")}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={exportToExcel} className="flex items-center px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 transition-all text-sm">
            <Download size={16} className="mr-2" /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm">
            <Download size={16} className="mr-2" /> PDF
          </button>
          <select 
            value={month} 
            onChange={e => setMonth(Number(e.target.value))}
            className="flex-1 md:w-32 p-2.5 border-2 border-[#ece4da] rounded-xl focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm bg-white text-sm"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{format(new Date(2000, i, 1), "MMMM")}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={e => setYear(Number(e.target.value))}
            className="flex-1 md:w-28 p-2.5 border-2 border-[#ece4da] rounded-xl focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm bg-white text-sm"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">{t("Loading")}</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                <tr className="border-b border-[#ece4da]">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">{t("Name")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">{t("Category")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">{t("WageType")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase bg-gray-50">{t("WageRate")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center bg-gray-50">{t("DaysPresent")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center bg-gray-50">{t("TotalHours")}</th>
                  <th className="p-4 text-xs font-bold text-green-600 uppercase text-right bg-gray-50">{t("TotalPaid")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4da]">
                {report.map(({ worker, daysPresent, totalHours, totalPaid }) => (
                  <tr key={worker.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-[#3d2f23]">{worker.name}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-[#99582a] bg-[#fef7e7] px-2 py-1 rounded border border-[#f5e3cd]">
                        {worker.category || "-"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-600">{t(worker.wageType)}</td>
                    <td className="p-4 font-bold text-gray-600">₹{worker.wageRate}</td>
                    <td className="p-4 font-black text-gray-800 text-center">{daysPresent}</td>
                    <td className="p-4 font-black text-gray-800 text-center">{totalHours}</td>
                    <td className="p-4 font-black text-green-700 bg-green-50/30 text-right">₹{totalPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-[#ece4da] shadow-sm gap-4">
          <div className="text-sm font-bold text-gray-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={limit} 
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="p-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#99582a] outline-none"
            >
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={150}>150 per page</option>
              <option value={200}>200 per page</option>
            </select>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button 
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
