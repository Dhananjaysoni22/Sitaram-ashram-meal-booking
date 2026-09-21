import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';
import { getReportBookings } from '../api/booking.api';
import { Search, Download } from 'lucide-react';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ViewBookingModal from '../components/ViewBookingModal';

export default function Reports() {
  const { t, i18n } = useTranslation();
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBooking, setViewBooking] = useState<any>(null);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({
    totalBookings: 0,
    completed: 0,
    cancelled: 0,
    totalMonks: 0,
    totalGuests: 0
  });

  const isHindi = i18n.language === 'hi';
  const localeToUse = isHindi ? hi : enUS;

  const fetchReports = () => {
    setLoading(true);
    getReportBookings(selectedYear, selectedMonth, searchQuery, page, limit)
      .then(res => {
        setFilteredBookings(res.data.data);
        setTotal(res.data.total);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear, searchQuery, page, limit]);

  const monthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM");

  const exportToExcel = async () => {
    const res = await getReportBookings(selectedYear, selectedMonth, searchQuery);
    const fullBookings = res.data.data;
    const data = fullBookings.map((b: any) => ({
      [t("Date")]: format(new Date(b.date), "dd MMM yyyy"),
      [t("MealType")]: t(b.mealType === "BALBHOG" ? "Balbhog" : b.mealType === "RAJBHOG" ? "Rajbhog" : b.mealType === "RAJBHOG_FIRST_FLOOR" ? "RajbhogFF" : b.mealType === "SAYANKALIN_FIRST_FLOOR" ? "SayankalinFF" : "Sayankalin"),
      [t("SponsorName")]: b.sponsorName,
      [t("MobileNumber")]: b.mobileNumber,
      [t("MonksCount")]: b.monksCount,
      [t("GuestsCount")]: b.guestsCount,
      [t("TotalCount")]: b.totalCount,
      [t("Status")]: t(b.status.charAt(0) + b.status.slice(1).toLowerCase()),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings Report");
    XLSX.writeFile(wb, `Bookings_Report_${monthName}_${selectedYear}.xlsx`);
  };

  const exportToPDF = async () => {
    const res = await getReportBookings(selectedYear, selectedMonth, searchQuery);
    const fullBookings = res.data.data;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`Bookings Report - ${monthName} ${selectedYear}`, 14, 20);
    
    const head = [[t("Date"), t("MealType"), t("SponsorName"), t("MobileNumber"), t("MonksCount"), t("GuestsCount"), t("TotalCount"), t("Status")]];
    const body = fullBookings.map((b: any) => [
      format(new Date(b.date), "dd MMM yyyy"),
      t(b.mealType === "BALBHOG" ? "Balbhog" : b.mealType === "RAJBHOG" ? "Rajbhog" : b.mealType === "RAJBHOG_FIRST_FLOOR" ? "RajbhogFF" : b.mealType === "SAYANKALIN_FIRST_FLOOR" ? "SayankalinFF" : "Sayankalin"),
      b.sponsorName,
      b.mobileNumber,
      b.monksCount,
      b.guestsCount,
      b.totalCount,
      t(b.status.charAt(0) + b.status.slice(1).toLowerCase()),
    ]);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [153, 88, 42] }
    });

    doc.save(`Bookings_Report_${monthName}_${selectedYear}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-6">
      
      {/* Header & Filters */}
      <div className="bg-[#fef7e7] border border-[#f5e3cd] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4a3b2c] mb-1">{t('Reports')}</h2>
          <p className="text-sm font-medium text-[#8a7662]">{t('ReportsDesc')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={exportToExcel} className="flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 transition-all text-sm">
            <Download size={16} className="mr-2" /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm">
            <Download size={16} className="mr-2" /> PDF
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={t('SearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#ece4da] focus:border-[#99582a] focus:ring focus:ring-[#99582a]/20 outline-none text-sm transition-all"
            />
          </div>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-[#ece4da] outline-none text-sm font-bold text-[#4a3b2c] bg-white"
          >
            {Array.from({length: 12}).map((_, i) => (
              <option key={i} value={i}>{format(new Date(2024, i, 1), "MMMM", { locale: localeToUse })}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-[#ece4da] outline-none text-sm font-bold text-[#4a3b2c] bg-white"
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('TotalBookings')}</p>
          <p className="text-2xl font-black text-[#99582a]">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('Completed')}</p>
          <p className="text-2xl font-black text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('Cancelled')}</p>
          <p className="text-2xl font-black text-red-500">{stats.cancelled}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('TotalMonks')}</p>
          <p className="text-2xl font-black text-[#8b5321]">{stats.totalMonks}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('TotalGuests')}</p>
          <p className="text-2xl font-black text-[#8b5321]">{stats.totalGuests}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t('Loading')}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('NoBookingsFound')}</div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                <tr className="border-b border-[#ece4da]">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('Date')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('MealType')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('SponsorName')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('Counts')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('Status')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4da]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-[#3d2f23]">{format(new Date(b.date), "dd MMM yyyy")}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-[#99582a] text-sm">{t(b.mealType === "BALBHOG" ? "Balbhog" : b.mealType === "RAJBHOG" ? "Rajbhog" : b.mealType === "RAJBHOG_FIRST_FLOOR" ? "RajbhogFF" : b.mealType === "SAYANKALIN_FIRST_FLOOR" ? "SayankalinFF" : "Sayankalin")}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{b.sponsorName}</p>
                      <p className="text-xs text-gray-500">{b.mobileNumber}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-[11px] text-gray-500 font-medium space-x-2">
                        <span>{t('MonksCount')}: <strong className="text-gray-800">{b.monksCount}</strong></span>
                        <span>{t('GuestsCount')}: <strong className="text-gray-800">{b.guestsCount}</strong></span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(b.status)}`}>
                        {t(b.status.charAt(0) + b.status.slice(1).toLowerCase())}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right space-x-2">
                      <button 
                        onClick={() => setViewBooking(b)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                      >
                        View
                      </button>
                    </td>
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

      {viewBooking && (
        <ViewBookingModal 
          booking={viewBooking} 
          onClose={() => setViewBooking(null)} 
        />
      )}
    </div>
  );
}
