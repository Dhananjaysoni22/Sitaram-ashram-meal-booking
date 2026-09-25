import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';
import { getReportBookings, deleteBooking, updateBookingStatus } from '../api/booking.api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Search, Download, ArrowUp, ArrowDown, Check } from 'lucide-react';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ViewBookingModal from '../components/ViewBookingModal';

export default function Reports() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBooking, setViewBooking] = useState<any>(null);
  
  // Filters
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({
    totalBookings: 0,
    completed: 0,
    cancelled: 0,
    totalMonks: 0,
    totalGuests: 0,
    totalWaiters: 0,
    totalValet: 0,
    totalCoolers: 0,
    totalGuards: 0,
    totalMasalchis: 0
  });

  const isHindi = i18n.language === 'hi';
  const localeToUse = isHindi ? hi : enUS;

  const handleUpdateStatus = async (id: string, status: 'COMPLETED' | 'CANCELLED') => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    try {
      await updateBookingStatus(id, status);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteBooking(id);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  const fetchReports = () => {
    setLoading(true);
    getReportBookings(startDate, endDate, searchQuery, statusFilter, sortField, sortOrder, page, limit)
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
  }, [startDate, endDate, searchQuery, statusFilter, sortField, sortOrder, page, limit]);

  const reportTitle = `${format(new Date(startDate), 'dd MMM yyyy')} to ${format(new Date(endDate), 'dd MMM yyyy')}`;

  const exportToExcel = async () => {
    const res = await getReportBookings(startDate, endDate, searchQuery, statusFilter, sortField, sortOrder, 1, 100000);
    const fullBookings = res.data.data;
    const data = fullBookings.map((b: any) => ({
      [t("Date")]: format(new Date(b.date), "dd MMM yyyy"),
      [t("MealType")]: t(b.mealType === "BALBHOG" ? "Balbhog" : b.mealType === "RAJBHOG" ? "Rajbhog" : b.mealType === "RAJBHOG_FIRST_FLOOR" ? "RajbhogFF" : b.mealType === "SAYANKALIN_FIRST_FLOOR" ? "SayankalinFF" : "Sayankalin"),
      [t("SponsorName")]: b.sponsorName,
      [t("MobileNumber")]: b.mobileNumber,
      [t("MonksCount")]: b.status === "CANCELLED" ? 0 : b.monksCount,
      [t("GuestsCount")]: b.status === "CANCELLED" ? 0 : b.guestsCount,
      [t("TotalCount")]: b.status === "CANCELLED" ? 0 : b.totalCount,
      "Waiters": b.status === "CANCELLED" ? 0 : (b.waiters || 0), "Valet": b.status === "CANCELLED" ? 0 : (b.valetParking || 0), "Coolers": b.status === "CANCELLED" ? 0 : (b.coolers || 0), "Guards": b.status === "CANCELLED" ? 0 : (b.guards || 0), "Masalchis": b.status === "CANCELLED" ? 0 : (b.masalchis || 0),
      [t("Status")]: b.status.charAt(0) + b.status.slice(1).toLowerCase(),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings Report");
    XLSX.writeFile(wb, `Bookings_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToPDF = async () => {
    const res = await getReportBookings(startDate, endDate, searchQuery, statusFilter, sortField, sortOrder, 1, 100000);
    const fullBookings = res.data.data;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(`Bookings Report (${reportTitle})`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Total Valid Bookings: ${stats.totalBookings}`, 14, 28);
    doc.text(`Monks: ${stats.totalMonks} | Guests: ${stats.totalGuests}`, 14, 34);

    const head = [["Date", "Meal Type", "Sponsor", "Mobile", "Monks", "Guests", "Total", "Status", "Extras"]];
    const body = fullBookings.map((b: any) => [
      format(new Date(b.date), "dd MMM yyyy"),
      b.mealType === "BALBHOG" ? "(Breakfast) Balbhog" : b.mealType === "RAJBHOG" ? "(Lunch) Rajbhog (Ground Floor)" : b.mealType === "RAJBHOG_FIRST_FLOOR" ? "(Lunch) Rajbhog (First Floor)" : b.mealType === "SAYANKALIN_FIRST_FLOOR" ? "(Dinner) Sayankalin Prasadi (First Floor)" : "(Dinner) Sayankalin Prasadi (Ground Floor)",
      b.sponsorName,
      b.mobileNumber,
      b.status === "CANCELLED" ? "0" : String(b.monksCount),
      b.status === "CANCELLED" ? "0" : String(b.guestsCount),
      b.status === "CANCELLED" ? "0" : String(b.totalCount),
      b.status,
      `W:${b.waiters||0} V:${b.valetParking||0} C:${b.coolers||0} G:${b.guards||0} M:${b.masalchis||0}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [153, 88, 42] },
      styles: { fontSize: 7, cellPadding: 1 }
    });

    doc.save(`Bookings_Report_${startDate}_to_${endDate}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION': return 'bg-yellow-100 text-yellow-800';
      case 'BOOKED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowDown size={14} className="opacity-20 inline ml-1" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} className="inline ml-1" /> : <ArrowDown size={14} className="inline ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#99582a]">{t('Reports')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('ReportsDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-white rounded-xl border-2 border-[#ece4da] overflow-hidden shadow-sm">
            <input 
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="p-2 outline-none text-sm font-bold text-gray-700 bg-transparent"
            />
            <span className="flex items-center px-2 text-gray-400 bg-gray-50 border-x border-[#ece4da]">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="p-2 outline-none text-sm font-bold text-gray-700 bg-transparent"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder={t('SearchSponsor')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border-2 border-[#ece4da] rounded-xl focus:border-[#99582a] outline-none font-bold text-[#3d2f23] shadow-sm text-sm w-48 sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm text-sm transition-colors whitespace-nowrap">
              <Download size={16} className="mr-2" /> Excel
            </button>
            <button onClick={exportToPDF} className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm text-sm transition-colors whitespace-nowrap">
              <Download size={16} className="mr-2" /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('')} 
          className={`bg-white p-5 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${statusFilter === '' ? 'border-[#99582a] ring-2 ring-[#99582a]/20' : 'border-[#ece4da] hover:border-[#99582a]'}`}
        >
          <p className="text-gray-500 font-bold mb-1">{t('TotalBookings')}</p>
          <p className="text-3xl font-black text-[#3d2f23]">{stats.totalBookings}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('COMPLETED')}
          className={`bg-green-50 p-5 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${statusFilter === 'COMPLETED' ? 'border-green-600 ring-2 ring-green-600/20' : 'border-green-100 hover:border-green-400'}`}
        >
          <p className="text-green-700 font-bold mb-1">{t('Completed')}</p>
          <p className="text-3xl font-black text-green-800">{stats.completed}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('CANCELLED')}
          className={`bg-red-50 p-5 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${statusFilter === 'CANCELLED' ? 'border-red-600 ring-2 ring-red-600/20' : 'border-red-100 hover:border-red-400'}`}
        >
          <p className="text-red-700 font-bold mb-1">{t('Cancelled')}</p>
          <p className="text-3xl font-black text-red-800">{stats.cancelled}</p>
        </div>
        <div className="bg-[#fef7e7] p-5 rounded-2xl border border-[#f5e3cd] shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#a36329] font-bold text-xs uppercase tracking-wider mb-1">{t('TotalMeals')}</p>
              <p className="text-2xl font-black text-[#4a3b2c]">{stats.totalMonks + stats.totalGuests}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#a36329] font-bold">{t('MonksCount')}: {stats.totalMonks}</p>
              <p className="text-xs text-[#a36329] font-bold">{t('GuestsCount')}: {stats.totalGuests}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#ece4da] shadow-sm">
        <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#99582a] mr-2"></span>
          Extra Services Used
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Waiters</p>
            <p className="text-lg font-black text-gray-700">{stats.totalWaiters || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Valet Parking</p>
            <p className="text-lg font-black text-gray-700">{stats.totalValet || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Coolers</p>
            <p className="text-lg font-black text-gray-700">{stats.totalCoolers || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Guards</p>
            <p className="text-lg font-black text-gray-700">{stats.totalGuards || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Masalchis</p>
            <p className="text-lg font-black text-gray-700">{stats.totalMasalchis || 0}</p>
          </div>
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
                  <th onClick={() => handleSort('date')} className="cursor-pointer select-none p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors">
                    {t('Date')} {renderSortIcon('date')}
                  </th>
                  <th onClick={() => handleSort('mealType')} className="cursor-pointer select-none p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors">
                    {t('MealType')} {renderSortIcon('mealType')}
                  </th>
                  <th onClick={() => handleSort('sponsorName')} className="cursor-pointer select-none p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors">
                    {t('SponsorName')} {renderSortIcon('sponsorName')}
                  </th>
                  <th onClick={() => handleSort('totalCount')} className="cursor-pointer select-none p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors">
                    {t('Counts')} {renderSortIcon('totalCount')}
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Extras
                  </th>
                  <th onClick={() => handleSort('status')} className="cursor-pointer select-none p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors">
                    {t('Status')} {renderSortIcon('status')}
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50">
                    {t('Actions')}
                  </th>
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
                    <td className="p-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {b.waiters > 0 && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold" title="Waiters">W: {b.waiters}</span>}
                        {b.valetParking > 0 && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold" title="Valet">V: {b.valetParking}</span>}
                        {b.coolers > 0 && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold" title="Coolers">C: {b.coolers}</span>}
                        {b.guards > 0 && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold" title="Guards">G: {b.guards}</span>}
                        {b.masalchis > 0 && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold" title="Masalchis">M: {b.masalchis}</span>}
                        {(!b.waiters && !b.valetParking && !b.coolers && !b.guards && !b.masalchis) && <span className="text-gray-400 font-medium">-</span>}
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
                      {user?.role === "SUPER_ADMIN" && (
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-colors ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
