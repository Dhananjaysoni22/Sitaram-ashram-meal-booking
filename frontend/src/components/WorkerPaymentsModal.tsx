import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getWorkerPayments, addPayment } from "../api/worker.api";
import { X, Plus, Clock } from "lucide-react";
import { format } from "date-fns";

export default function WorkerPaymentsModal({ worker, onClose }: { worker: any, onClose: () => void }) {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [worker]);

  const fetchPayments = () => {
    setLoading(true);
    getWorkerPayments(worker.id).then((res) => {
      setPayments(res.data.data);
      setLoading(false);
    });
  };

  const handleAddPayment = async () => {
    if (!amount || !paymentDate) return;
    try {
      await addPayment(worker.id, Number(amount), paymentDate, notes);
      setAmount("");
      setNotes("");
      fetchPayments();
    } catch (e) {
      alert("Error adding payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#ece4da] flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[#3d2f23]">{t("WorkerPayments")}</h3>
            <p className="text-gray-500 text-sm mt-1">{worker.name} • {t(worker.wageType)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Add Payment Form */}
          <div className="md:w-1/3 space-y-4">
            <h4 className="font-bold text-gray-800 border-b pb-2">{t("AddPayment")}</h4>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("Amount")} (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2.5 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("Date")}</label>
              <input 
                type="date" 
                value={paymentDate} 
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full p-2.5 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("Notes")}</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2.5 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none text-sm"
                rows={2}
              />
            </div>
            <button 
              onClick={handleAddPayment}
              disabled={!amount}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Plus size={18} className="mr-1" /> {t("SavePayment")}
            </button>
          </div>

          {/* History */}
          <div className="md:w-2/3">
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">{t("PaymentHistory")}</h4>
            {loading ? (
              <p className="text-gray-500 text-sm">{t("Loading")}</p>
            ) : payments.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t("NoPaymentsFound")}</p>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">₹{p.amount}</p>
                      {p.notes && <p className="text-xs text-gray-500 mt-0.5">{p.notes}</p>}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="flex items-center text-xs font-bold text-gray-500">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(p.paymentDate), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
