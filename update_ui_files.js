const fs = require('fs');

// Update Attendance.tsx
let a = fs.readFileSync('frontend/src/pages/Attendance.tsx', 'utf8');

a = a.replace(
  `const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));`,
  `const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState<"ASHRAM" | "MANDIR">("ASHRAM");`
);

a = a.replace(
  `[selectedDate]`,
  `[selectedDate, activeTab]`
);

a = a.replace(
  `getAllWorkers(),`,
  `getAllWorkers(activeTab),`
);

a = a.replace(
  `        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#99582a]">{t("Attendance")}</h2>`,
  `        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#99582a]">{t("Attendance")}</h2>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setActiveTab("ASHRAM")}
                className={\`font-bold pb-1 border-b-2 transition-colors \${activeTab === "ASHRAM" ? "border-[#99582a] text-[#99582a]" : "border-transparent text-gray-400 hover:text-gray-600"}\`}
              >
                Ashram Workers
              </button>
              <button 
                onClick={() => setActiveTab("MANDIR")}
                className={\`font-bold pb-1 border-b-2 transition-colors \${activeTab === "MANDIR" ? "border-[#99582a] text-[#99582a]" : "border-transparent text-gray-400 hover:text-gray-600"}\`}
              >
                Mandir Workers
              </button>
            </div>`
);

fs.writeFileSync('frontend/src/pages/Attendance.tsx', a);

// Update WorkerReports.tsx
let r = fs.readFileSync('frontend/src/pages/WorkerReports.tsx', 'utf8');

r = r.replace(
  `const [month, setMonth] = useState(today.getMonth()); // 0-11`,
  `const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [activeTab, setActiveTab] = useState<"ASHRAM" | "MANDIR">("ASHRAM");`
);

r = r.replace(
  `getMonthlyReport(year, month, page, limit).then(res => {`,
  `getMonthlyReport(year, month, activeTab, page, limit).then(res => {`
);

r = r.replace(
  `[year, month, page, limit]`,
  `[year, month, activeTab, page, limit]`
);

r = r.replace(
  `const res = await getMonthlyReport(year, month);`,
  `const res = await getMonthlyReport(year, month, activeTab);` // export function inside
);

r = r.replace(
  `        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#99582a]">{t("WorkerReports")}</h2>`,
  `        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#99582a]">{t("WorkerReports")}</h2>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setActiveTab("ASHRAM")}
                className={\`font-bold pb-1 border-b-2 transition-colors \${activeTab === "ASHRAM" ? "border-[#99582a] text-[#99582a]" : "border-transparent text-gray-400 hover:text-gray-600"}\`}
              >
                Ashram Workers
              </button>
              <button 
                onClick={() => setActiveTab("MANDIR")}
                className={\`font-bold pb-1 border-b-2 transition-colors \${activeTab === "MANDIR" ? "border-[#99582a] text-[#99582a]" : "border-transparent text-gray-400 hover:text-gray-600"}\`}
              >
                Mandir Workers
              </button>
            </div>`
);

fs.writeFileSync('frontend/src/pages/WorkerReports.tsx', r);

console.log("Updated Attendance and Reports UI");
