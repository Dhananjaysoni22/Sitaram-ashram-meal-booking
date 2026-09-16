import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllWorkers, getAttendance, checkInWorker, checkOutWorker, markAbsent } from "../api/worker.api";
import { format } from "date-fns";
import { LogIn, LogOut, XCircle, CheckCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function Attendance() {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const isTodayDate = selectedDate === format(new Date(), "yyyy-MM-dd");

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

  const handleCheckIn = async (workerId: string) => {
    await checkInWorker(workerId, selectedDate);
    fetchData();
  };

  const handleCheckOut = async (workerId: string) => {
    await checkOutWorker(workerId, selectedDate);
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
      const hasCheckedIn = !!record?.entryTime;
      const hasCheckedOut = !!record?.exitTime;

      let status = "Not Marked";
      if (isPresent === false) status = "Absent";
      else if (hasCheckedOut) status = "Completed";
      else if (hasCheckedIn) status = "In Progress";

      return {
        name: worker.name,
        category: worker.category || "-",
        wageType: t(worker.wageType),
        status,
        inTime: record?.entryTime ? format(new Date(record.entryTime), "hh:mm a") : "-",
        outTime: record?.exitTime ? format(new Date(record.exitTime), "hh:mm a") : "-",
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
      [t("In")]: r.inTime,
      [t("Out")]: r.outTime,
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
    
    const head = [[t("Name"), t("Category"), t("WageType"), t("Status"), t("In"), t("Out")]];
    const rawData = getExportData();
    const body = rawData.map(r => [
      r.name,
      r.category,
      r.wageType,
      r.status,
      r.inTime,
      r.outTime
    ]);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [153, 88, 42] } // #99582a
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
          const hasCheckedIn = !!record?.entryTime;
          const hasCheckedOut = !!record?.exitTime;

          return (
            <div key={worker.id} className={`p-5 rounded-2xl border ${isPresent === false ? 'bg-red-50/50 border-red-100' : hasCheckedOut ? 'bg-green-50/50 border-green-100' : 'bg-white border-[#ece4da] shadow-sm'} transition-colors relative`}>
              
              <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#3d2f23]">{worker.name}</h3>
                    <p className="text-xs font-bold text-[#99582a]">
                      {t(worker.wageType)} {worker.category ? ` • ${worker.category}` : ""}
                    </p>
                  </div>
                {isPresent === false && <XCircle className="text-red-400" size={24} />}
                {hasCheckedOut && <CheckCircle className="text-green-500" size={24} />}
              </div>

              {isPresent === false ? (
                <div className="text-sm font-bold text-red-500 bg-red-100/50 p-2 rounded-lg text-center">
                  {t("MarkedAbsent")}
                </div>
              ) : hasCheckedOut ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 bg-white p-2 rounded-lg border border-green-100">
                    <span>{t("In")}: <strong>{format(new Date(record.entryTime), "hh:mm a")}</strong></span>
                    <span>{t("Out")}: <strong>{format(new Date(record.exitTime), "hh:mm a")}</strong></span>
                  </div>
                  <div className="text-sm font-bold text-green-700 bg-green-100/50 p-2 rounded-lg text-center">
                    {t("TotalHours")}: {record.totalHours} hrs
                  </div>
                </div>
              ) : hasCheckedIn ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 flex justify-between bg-gray-50 p-2 rounded-lg">
                    <span>{t("CheckedInAt")}</span>
                    <strong className="text-gray-800">{format(new Date(record.entryTime), "hh:mm a")}</strong>
                  </p>
                  {isTodayDate && (
                    <button 
                      onClick={() => handleCheckOut(worker.id)}
                      className="w-full flex items-center justify-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                    >
                      <LogOut size={16} className="mr-2" /> {t("CheckOut")}
                    </button>
                  )}
                  {!isTodayDate && (
                    <div className="text-sm font-bold text-orange-500 bg-orange-50 p-2 rounded-lg text-center">
                      Did not check out
                    </div>
                  )}
                </div>
              ) : isTodayDate ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCheckIn(worker.id)}
                    className="flex-1 flex items-center justify-center py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <LogIn size={16} className="mr-2" /> {t("CheckIn")}
                  </button>
                  <button 
                    onClick={() => handleAbsent(worker.id)}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-colors"
                    title={t("MarkAbsent")}
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                <div className="text-sm font-bold text-gray-400 bg-gray-50 p-2 rounded-lg text-center">
                  No Record
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
