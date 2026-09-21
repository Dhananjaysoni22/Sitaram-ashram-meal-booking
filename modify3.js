const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Reports.tsx', 'utf8');

// Update stats state
const oldState = `  const [stats, setStats] = useState({
    totalBookings: 0,
    completed: 0,
    cancelled: 0,
    totalMonks: 0,
    totalGuests: 0
  });`;
const newState = `  const [stats, setStats] = useState({
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
  });`;
c = c.replace(oldState, newState);

// Update Cards
const oldCards = `      {/* Stats Cards */}
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
      </div>`;

const newCards = `      {/* Stats Cards */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('TotalBookings')}</p>
            <p className="text-2xl font-black text-[#99582a]">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('Completed')}</p>
            <p className="text-2xl font-black text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('Cancelled')}</p>
            <p className="text-2xl font-black text-red-500">{stats.cancelled}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('TotalMonks')}</p>
            <p className="text-2xl font-black text-[#8b5321]">{stats.totalMonks}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#ece4da] shadow-sm flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('TotalGuests')}</p>
            <p className="text-2xl font-black text-[#8b5321]">{stats.totalGuests}</p>
          </div>
        </div>

        {/* Extras Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
      </div>`;

c = c.replace(oldCards, newCards);
fs.writeFileSync('frontend/src/pages/Reports.tsx', c);
console.log("Done");
