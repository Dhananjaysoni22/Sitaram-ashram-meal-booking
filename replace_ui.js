const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Home.tsx', 'utf8');

const startStr = '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">';
const startIndex = c.indexOf(startStr);

// Find "{viewBooking && (" after startIndex
const viewBookingIndex = c.indexOf('{viewBooking && (', startIndex);

if (startIndex !== -1 && viewBookingIndex !== -1) {
  const newTable = `          <div className="bg-white rounded-2xl border border-[#ece4da] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                  <tr className="border-b border-[#ece4da]">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('Date')}</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('MealType')}</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('SponsorName')}</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('Counts')}</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Extras</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{t('Status')}</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right bg-gray-50">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece4da]">
                  {upcomingBookings.map((b) => (
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
                        <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold \${
                          b.status === 'PENDING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-700' :
                          b.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                          b.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }\`}>
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
            </div>\n        `;

  // We need to replace everything from startIndex up to the end of the div that precedes {viewBooking && (
  // To be safe, let's find the `</div>\n      </div>\n\n      {viewBooking && (` with flexible spacing
  const regex = /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">[\s\S]*?\{viewBooking && \(/;
  if (regex.test(c)) {
    c = c.replace(regex, newTable + "{viewBooking && (");
    fs.writeFileSync('frontend/src/pages/Home.tsx', c);
    console.log("Replaced via regex!");
  } else {
    console.log("Regex failed too");
  }
}
