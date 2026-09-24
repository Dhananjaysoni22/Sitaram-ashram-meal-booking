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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="p-4 text-gray-500">{t("Loading")}</p>
        ) : workers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(worker => {
          const record = getRecord(worker.id);
          const isPresent = record?.isPresent;

          return (
            <div key={worker.id} className={`p-5 rounded-2xl border ${isPresent === false ? 'bg-red-50/50 border-red-100' : isPresent === true ? 'bg-green-50/50 border-green-100' : 'bg-white border-[#ece4da] shadow-sm'} transition-colors relative`}>
              
              <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#3d2f23]">{worker.name}</h3>
                    <p className="text-xs font-bold text-[#99582a]">
                      {t(worker.wageType)} {worker.category ? ` • ${worker.category}` : ""}
                    </p>
                  </div>
                {isPresent === false && <XCircle className="text-red-400" size={24} />}
                {isPresent === true && <CheckCircle className="text-green-500" size={24} />}
              </div>

              {isPresent === undefined ? (
                <div className="text-sm font-bold text-gray-400 bg-gray-50 p-2 rounded-lg text-center mb-3">
                  Not Marked
                </div>
              ) : (
                <div className={`text-sm font-bold ${isPresent ? 'text-green-600 bg-green-100/50' : 'text-red-500 bg-red-100/50'} p-2 rounded-lg text-center mb-3`}>
                  {isPresent ? 'Present' : 'Absent'}
                </div>
              )}

              {user?.role === "SUPER_ADMIN" && (
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <button 
                    onClick={() => handlePresent(worker.id)}
                    className={`flex-1 py-2 font-bold rounded-xl border transition-colors ${isPresent === true ? 'bg-green-500 text-white border-green-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50'}`}
                  >
                    Present
                  </button>
                  <button 
                    onClick={() => handleAbsent(worker.id)}
                    className={`flex-1 py-2 font-bold rounded-xl border transition-colors ${isPresent === false ? 'bg-red-500 text-white border-red-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-red-50'}`}
                  >
                    Absent
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
