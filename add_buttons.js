const fs = require('fs');

function addProfileModal(filePath) {
  let w = fs.readFileSync(filePath, 'utf8');
  
  if (!w.includes('WorkerProfileModal')) {
    w = w.replace(
      `import WorkerPaymentsModal from "../components/WorkerPaymentsModal";`,
      `import WorkerPaymentsModal from "../components/WorkerPaymentsModal";\nimport WorkerProfileModal from "../components/WorkerProfileModal";`
    );

    w = w.replace(
      `const [paymentWorker, setPaymentWorker] = useState<any>(null);`,
      `const [paymentWorker, setPaymentWorker] = useState<any>(null);\n  const [profileWorkerId, setProfileWorkerId] = useState<string | null>(null);`
    );

    w = w.replace(
      /import \{.*\} from "lucide-react";/,
      (match) => match.replace("}", ", Eye }")
    );
    if (!w.includes("Eye }")) {
       w = w.replace("import {", "import { Eye,"); 
    }

    w = w.replace(
      `onClick={() => setPaymentWorker(worker)}`,
      `onClick={() => setProfileWorkerId(worker.id)}
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    title="View History"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => setPaymentWorker(worker)}`
    );

    w = w.replace(
      `<WorkerPaymentsModal worker={paymentWorker} onClose={() => setPaymentWorker(null)} />\n      )}`,
      `<WorkerPaymentsModal worker={paymentWorker} onClose={() => setPaymentWorker(null)} />\n      )}\n      {profileWorkerId && (\n        <WorkerProfileModal workerId={profileWorkerId} onClose={() => setProfileWorkerId(null)} />\n      )}`
    );

    fs.writeFileSync(filePath, w);
  }
}

addProfileModal('frontend/src/pages/Workers.tsx');
addProfileModal('frontend/src/pages/MandirWorkers.tsx');
console.log("Added profile modal buttons");
