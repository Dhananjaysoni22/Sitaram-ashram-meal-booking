import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllWorkers, createWorker, updateWorker } from "../api/worker.api";
import { getWorkerCategories } from "../api/setup.api";
import { Plus, Edit2, CheckCircle, XCircle, FileText } from "lucide-react";
import WorkerPaymentsModal from "../components/WorkerPaymentsModal";
import { useNavigate } from "react-router-dom";

export default function Workers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [paymentWorker, setPaymentWorker] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    category: "",
    wageType: "DAILY",
    wageRate: "",
    isActive: true
  });

  useEffect(() => {
    fetchWorkers();
    getWorkerCategories().then(res => setCategories(res.data.data)).catch(console.error);
  }, []);

  const fetchWorkers = () => {
    setLoading(true);
    getAllWorkers().then((res) => {
      setWorkers(res.data.data);
      setLoading(false);
    });
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        wageRate: Number(formData.wageRate)
      };

      if (editingWorker) {
        await updateWorker(editingWorker.id, data);
      } else {
        await createWorker(data);
      }
      
      setShowAddModal(false);
      setEditingWorker(null);
      setFormData({ name: "", mobileNumber: "", category: "", wageType: "DAILY", wageRate: "", isActive: true });
      fetchWorkers();
    } catch (error) {
      alert("Error saving worker");
    }
  };

  const openEdit = (worker: any) => {
    setFormData({
      name: worker.name,
      mobileNumber: worker.mobileNumber || "",
      category: worker.category || "",
      wageType: worker.wageType,
      wageRate: worker.wageRate.toString(),
      isActive: worker.isActive
    });
    setEditingWorker(worker);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#99582a]">{t("WorkersDirectory")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("WorkersDesc")}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate("/workers/reports")}
            className="flex items-center px-4 py-2 bg-[#fdfbf6] text-[#99582a] border border-[#99582a] font-bold rounded-xl shadow-sm hover:bg-[#f5e3cd] transition-all"
          >
            <FileText size={18} className="mr-2" />
            {t("MonthlyReport")}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-[#99582a] text-white font-bold rounded-xl shadow-sm hover:bg-[#78431e] transition-all"
          >
            <Plus size={18} className="mr-1" />
            {t("AddWorker")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t("Loading")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#ece4da]">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t("Name")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t("Category")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t("WageType")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t("WageRate")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t("Status")}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4da]">
                {workers.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold text-[#3d2f23]">{w.name}</p>
                      <p className="text-xs text-gray-500">{w.mobileNumber}</p>
                    </td>
                    <td className="p-4 font-bold text-gray-600 text-sm">
                      {w.category || "-"}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[#99582a] text-sm">{t(w.wageType)}</span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      ₹{w.wageRate}
                    </td>
                    <td className="p-4">
                      {w.isActive ? (
                        <span className="flex items-center text-xs font-bold text-green-600">
                          <CheckCircle size={14} className="mr-1" /> {t("Active")}
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-bold text-red-500">
                          <XCircle size={14} className="mr-1" /> {t("Inactive")}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setPaymentWorker(w)}
                        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200 transition-colors"
                      >
                        {t("Payments")}
                      </button>
                      <button 
                        onClick={() => openEdit(w)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                      >
                        {t("Edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-[#3d2f23] mb-6">
              {editingWorker ? t("EditWorker") : t("AddWorker")}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("Name")}</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("MobileNumber")}</label>
                <input 
                  type="text" 
                  value={formData.mobileNumber} 
                  onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("Category")}</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                >
                  <option value="">-- {t("SelectCategory")} --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("WageType")}</label>
                  <select 
                    value={formData.wageType}
                    onChange={e => setFormData({...formData, wageType: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                  >
                    <option value="DAILY">{t("DAILY")}</option>
                    <option value="MONTHLY">{t("MONTHLY")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("WageRate")} (₹)</label>
                  <input 
                    type="number" 
                    value={formData.wageRate} 
                    onChange={e => setFormData({...formData, wageRate: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                  />
                </div>
              </div>

              {editingWorker && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("Status")}</label>
                  <select 
                    value={formData.isActive ? "true" : "false"}
                    onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                  >
                    <option value="true">{t("Active")}</option>
                    <option value="false">{t("Inactive")}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingWorker(null);
                }}
                className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                {t("Cancel")}
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.wageRate}
                className="px-6 py-3 bg-[#99582a] text-white font-bold rounded-xl shadow hover:bg-[#78431e] disabled:opacity-50 transition-colors"
              >
                {t("Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentWorker && (
        <WorkerPaymentsModal 
          worker={paymentWorker} 
          onClose={() => setPaymentWorker(null)} 
        />
      )}
    </div>
  );
}
