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
  const [activeTab, setActiveTab] = useState<"ASHRAM" | "MANDIR">("ASHRAM");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([
        getAllWorkers(activeTab),
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
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setActiveTab("ASHRAM")}
                className={`font-bold pb-1 border-b-2 transition-colors ${activeTab === "ASHRAM" ? "border-[#99582a] text-[#99582a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Ashram Workers
              </button>
              <button 
                onClick={() => setActiveTab("MANDIR")}
                className={`font-bold pb-1 border-b-2 transition-colors ${activeTab === "MANDIR" ? "border-[#99582a] text-[#99582a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Mandir Workers
              </button>
            </div>
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

      
      {loading ? (
        <div className="p-8 text-center font-bold text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {workers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(worker => {
            const record = getRecord(worker.id);
            const isPresent = record?.isPresent;
            
            return (
              <div key={worker.id} className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${isPresent === false ? 'border-red-200 bg-red-50/30' : isPresent === true ? 'border-green-200 bg-green-50/30' : 'border-[#ece4da] hover:border-[#99582a]'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#3d2f23] text-lg">{worker.name}</h3>
                    <p className="text-sm font-bold text-gray-500">{worker.category || "-"}</p>
                    <p className="text-xs text-gray-400">{t(worker.wageType)}</p>
                  </div>
                  
                  {isPresent === undefined ? (
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600">Not Marked</span>
                  ) : isPresent === true ? (
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700">Present</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-100 text-red-700">Absent</span>
                  )}
                </div>

                {(isPresent === undefined || user?.role === "SUPER_ADMIN") && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handlePresent(worker.id)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${isPresent === true ? 'bg-green-500 text-white border-green-600' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => handleAbsent(worker.id)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${isPresent === false ? 'bg-red-500 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                    >
                      Absent
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}