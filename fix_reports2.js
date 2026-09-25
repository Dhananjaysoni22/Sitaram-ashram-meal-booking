const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Reports.tsx', 'utf8');

c = c.replace(
  `                      <td className="p-4 whitespace-nowrap text-right space-x-2">
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
                      </td>`,
  `                      <td className="p-4 whitespace-nowrap text-right space-x-2">
                        <button 
                          onClick={() => setViewBooking(b)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                        >
                          View
                        </button>
                        {user?.role === "SUPER_ADMIN" && b.status !== "COMPLETED" && b.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold border border-green-200 transition-colors ml-2"
                            title="Mark Completed"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {user?.role === "SUPER_ADMIN" && (
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-colors ml-2"
                            title="Delete Booking"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>`
);

fs.writeFileSync('frontend/src/pages/Reports.tsx', c);
console.log("Fixed Reports");
