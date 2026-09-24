import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllWorkers, getAttendance, checkInWorker, markAbsent } from "../api/worker.api";
import { format } from "date-fns";
import { XCircle, CheckCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([
        getAllWorkers(),
        getAttendance(selectedDate)
      ]);
      setWorkers(wRes.data.data.filter((w: any) => w.isActive));
      setAttendanceRecords(aRes.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getRecord = (workerId: string) => {
    return attendanceRecords.find(a => a.workerId === workerId);
  };

  const handlePresent = async (workerId: string) => {
    await checkInWorker(workerId, selectedDate);
    fetchData();
  };

  const handleAbsent = async (workerId: string) => {
    await markAbsent(workerId, selectedDate);
    fetchData();
  };

  const getExportData = () => {
    return workers.map(worker => {
      const record = getRecord(worker.id);
      const isPresent = record?.isPresent;
      
      let status = "Not Marked";
      if (isPresent === true) status = "Present";
      else if (isPresent === false) status = "Absent";

      return {
        name: worker.name,
        category: worker.category || "-",
        wageType: t(worker.wageType),
        status,
        wageRate: worker.wageRate
      };
    });
  };

  const exportToExcel = () => {
    const rawData = getExportData();
    const data = rawData.map(r => ({
      [t("Name")]: r.name,
      [t("Category")]: r.category,
      [t("WageType")]: r.wageType,
      [t("Status")]: r.status,
      [t("WageRate")]: r.wageRate
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Attendance");
    XLSX.writeFile(wb, `Attendance_${selectedDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`Daily Attendance Report - ${format(new Date(selectedDate), "dd MMM yyyy")}`, 14, 20);
    
    const head = [[t("Name"), t("Category"), t("WageType"), t("Status")]];
    const rawData = getExportData();
    const body = rawData.map(r => [
      r.name,
      r.category,
      r.wageType,
      r.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [153, 88, 42] }
    });

    doc.save(`Attendance_${selectedDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#99582a]">{t("DailyAttendance")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("AttendanceDesc")}</p>
        </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button onClick={exportToExcel} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm text-sm transition-colors">
              <Download size={16} className="mr-2" /> Excel
            </button>
            <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm text-sm transition-colors">
              <Download size={16} className="mr-2" /> PDF
            </button>
            <input 
              type="text"
              placeholder="Search worker..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 p-2 border-2 border-[#ece4da] rounded-xl focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm text-sm"
            />
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full sm:w-40 p-2 border-2 border-[#ece4da] rounded-xl focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm text-sm"
            />
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#ece4da] shadow-sm overflow-hidden overflow-x-auto w-full max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse relative text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr className="border-b border-[#ece4da]">
              <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("Name")}</th>
              <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("Category")}</th>
              <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("Status")}</th>
              <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece4da]">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">{t("Loading")}</td>
              </tr>
            ) : (
              workers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(worker => {
                const record = getRecord(worker.id);
                const isPresent = record?.isPresent;
      
                return (
                  <tr key={worker.id} className={`hover:bg-gray-50/50 transition-colors ${isPresent === false ? 'bg-red-50/30' : isPresent === true ? 'bg-green-50/30' : ''}`}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="font-bold text-[#3d2f23]">{worker.name}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="font-bold text-gray-800">{worker.category || "-"}</p>
                      <p className="text-xs text-gray-500">{t(worker.wageType)}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {isPresent === undefined ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                          Not Marked
                        </span>
                      ) : isPresent === true ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                          Present
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      {(isPresent === undefined || user?.role === "SUPER_ADMIN") && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handlePresent(worker.id)}
                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${isPresent === true ? 'bg-green-500 text-white border-green-600' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => handleAbsent(worker.id)}
                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${isPresent === false ? 'bg-red-500 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                          >
                            Absent
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
