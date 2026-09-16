import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';
import { getAllBookings } from '../api/booking.api';
import { getMonthlyFestivals } from '../api/calendar.api';

export default function CalendarView() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [festivals, setFestivals] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Fetch all bookings for the calendar
    getAllBookings()
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err));
      
    // Fetch festivals
    getMonthlyFestivals(currentDate.getFullYear(), currentDate.getMonth() + 1)
      .then(res => setFestivals(res.data.data))
      .catch(console.error);
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayIndex = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayIndex });

  const isHindi = i18n.language === 'hi';
  const localeToUse = isHindi ? hi : enUS;

  // Helper to determine dot color for a specific meal on a specific day
  const getMealDotColor = (date: Date, baseMealType: string) => {
    const dayBookings = bookings.filter(
      (b) =>
        b.mealType.includes(baseMealType) &&
        new Date(b.date).toDateString() === date.toDateString() &&
        b.status !== "CANCELLED"
    );

    if (dayBookings.length === 0) return "bg-gray-300"; // Available
    
    // If ANY of the bookings for this meal type (ground or first floor) are still pending/booked, show red.
    // Otherwise if all are completed, show green.
    const allCompleted = dayBookings.every(b => b.status === "COMPLETED");
    if (allCompleted) return "bg-green-500"; // Completed
    
    return "bg-red-400"; // Booked
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 md:pb-6">
      
      {/* Calendar Header */}
      <div className="bg-[#fef7e7] border border-[#f5e3cd] rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#4a3b2c] capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: localeToUse })}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#ece4da] rounded-lg text-[#99582a] hover:bg-[#fdfbf6] shadow-sm font-bold"
          >
            &lt;
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#ece4da] rounded-lg text-[#99582a] hover:bg-[#fdfbf6] shadow-sm font-bold"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] p-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-[#8a7662] uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
            {paddingDays.map((_, i) => (
               <div key={`pad-${i}`} className="min-h-[70px] sm:min-h-[80px] lg:min-h-[90px] xl:min-h-[100px] rounded-xl bg-gray-50/50" />
            ))}
          
          {days.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayFestivals = festivals[dateStr] || [];
            const isCurrentDay = isToday(day);
            const hasFestival = dayFestivals.length > 0;
            
            return (
              <div 
                key={day.toString()} 
                className={`flex flex-col p-1 sm:p-2 lg:p-3 min-h-[70px] sm:min-h-[80px] lg:min-h-[90px] xl:min-h-[100px] border rounded-xl transition-colors relative overflow-hidden ${
                  isCurrentDay 
                    ? 'border-[#a36329] bg-[#fef7e7] shadow-inner' 
                    : hasFestival
                      ? 'border-[#f0eade] bg-purple-50/40 hover:border-[#d9cbb8]'
                      : 'border-[#f0eade] hover:border-[#d9cbb8]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs sm:text-sm font-bold mb-1 text-center sm:text-left ${isCurrentDay ? 'text-[#99582a]' : 'text-gray-700'}`}>
                    {format(day, "d")}
                  </span>
                </div>

                {hasFestival && (
                  <div className="mb-1 flex-1 hidden sm:block">
                    {dayFestivals.map((f, i) => (
                      <div key={i} className="text-[9px] sm:text-[10px] font-bold text-purple-700 bg-purple-100 rounded px-1 py-0.5 truncate leading-tight mt-0.5" title={f}>
                        ✨ {f}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Visual Indicators for Meals (B, R, S) */}
                <div className="flex flex-row sm:flex-col justify-center sm:justify-start gap-1 sm:gap-0.5 mt-auto pb-1 sm:pb-0">
                  <div className="flex items-center sm:gap-1" title={t('Balbhog')}>
                    <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full ${getMealDotColor(day, 'BALBHOG')}`}></div>
                    <span className="text-[10px] text-gray-500 hidden sm:block">{t('Balbhog')}</span>
                  </div>
                  <div className="flex items-center sm:gap-1" title={t('Rajbhog')}>
                    <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full ${getMealDotColor(day, 'RAJBHOG')}`}></div>
                    <span className="text-[10px] text-gray-500 hidden sm:block">{t('Rajbhog')}</span>
                  </div>
                  <div className="flex items-center sm:gap-1" title={t('Sayankalin')}>
                    <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full ${getMealDotColor(day, 'SAYANKALIN')}`}></div>
                    <span className="text-[10px] text-gray-500 hidden sm:block">{t('Sayankalin')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Festivals this Month Card (Mobile Only) */}
        {Object.keys(festivals).length > 0 && (
          <div className="mt-6 sm:hidden bg-purple-50 rounded-2xl shadow-sm border border-purple-100 p-4">
            <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
              🕉️ Festivals this Month
            </h3>
            <div className="space-y-2">
              {Object.entries(festivals)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, fests]) => (
                <div key={date} className="flex gap-3 text-sm">
                  <div className="font-bold text-purple-900 min-w-[50px]">
                    {format(new Date(date), "MMM d")}
                  </div>
                  <div className="text-purple-800">
                    {fests.map(f => f).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center border-t border-[#ece4da] pt-4">
          <div className="flex items-center text-xs font-medium text-gray-600">
             <div className="w-2.5 h-2.5 rounded-full bg-gray-300 mr-2"></div> {t('Available')}
          </div>
          <div className="flex items-center text-xs font-medium text-gray-600">
             <div className="w-2.5 h-2.5 rounded-full bg-red-400 mr-2"></div> {t('Booked')}
          </div>
          <div className="flex items-center text-xs font-medium text-gray-600">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div> {t('Completed')}
          </div>
        </div>

      </div>
    </div>
  );
}
