import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getOccasions,
  createOccasion,
  deleteOccasion,
  getWorkerCategories,
  createWorkerCategory,
  deleteWorkerCategory,
  getRoles,
  createRole,
  deleteRole
} from "../api/setup.api";
import { getAllFestivals, createFestival, deleteFestival } from "../api/calendar.api";
import { format } from "date-fns";
import { Plus, Trash2, Settings, Users, Star, Shield, UserCog, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PermissionsMatrix from "../components/PermissionsMatrix";

export default function Setup() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"occasions" | "categories" | "mandirCategories" | "roles" | "permissions" | "festivals">("permissions");

  const [occasions, setOccasions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [mandirCategories, setMandirCategories] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [festivals, setFestivals] = useState<any[]>([]);
  
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [occRes, catRes, mandirCatRes, roleRes, festRes] = await Promise.all([
        getOccasions(), 
        getWorkerCategories("ASHRAM"), 
        getWorkerCategories("MANDIR"),
        getRoles(),
        getAllFestivals()
      ]);
      setOccasions(occRes.data.data);
      setCategories(catRes.data.data);
      setMandirCategories(mandirCatRes.data.data);
      setRoles(roleRes.data.data);
      setFestivals(festRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (activeTab === "festivals" && !newDate) return;
    
    setLoading(true);
    setError("");
    try {
      if (activeTab === "occasions") {
        await createOccasion(newName);
      } else if (activeTab === "categories") {
        await createWorkerCategory(newName, "ASHRAM");
      } else if (activeTab === "mandirCategories") {
        await createWorkerCategory(newName, "MANDIR");
      } else if (activeTab === "roles") {
        await createRole(newName);
      } else if (activeTab === "festivals") {
        await createFestival({ name: newName, date: newDate });
      }
      setNewName("");
      setNewDate("");
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.error || "Error creating record");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      if (activeTab === "occasions") {
        await deleteOccasion(id);
      } else if (activeTab === "categories") {
        await deleteWorkerCategory(id);
      } else if (activeTab === "roles") {
        await deleteRole(id);
      } else if (activeTab === "festivals") {
        await deleteFestival(id);
      }
      fetchData();
    } catch (e: any) {
      alert("Error deleting record");
    }
  };

  if (user?.role !== "SUPER_ADMIN") {
    return <div className="p-8 text-center text-red-500 font-bold text-xl">Not Authorized</div>;
  }

  const currentList = activeTab === "occasions" ? occasions : activeTab === "categories" ? categories : activeTab === "festivals" ? festivals : roles;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="text-[#99582a]" size={28} />
        <div>
          <h2 className="text-2xl font-black text-[#3d2f23]">{t("SystemSetup")}</h2>
          <p className="text-gray-500 text-sm">{t("SystemSetupDesc")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] overflow-hidden">
        
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row border-b border-[#ece4da]">
          <button
            onClick={() => { setActiveTab("festivals"); setError(""); setNewName(""); setNewDate(""); }}
            className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center transition-colors ${
              activeTab === "festivals"
                ? "bg-[#fef7e7] text-[#99582a] border-b-2 border-[#99582a]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Calendar size={16} className="mr-2" /> Calendar Festivals
          </button>
          <button
            onClick={() => { setActiveTab("occasions"); setError(""); setNewName(""); }}
            className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center transition-colors ${
              activeTab === "occasions"
                ? "bg-[#fef7e7] text-[#99582a] border-b-2 border-[#99582a]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Star size={16} className="mr-2" /> {t("SpecialOccasions")}
          </button>
          <button
            onClick={() => { setActiveTab("categories"); setError(""); setNewName(""); }}
            className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center transition-colors ${
              activeTab === "categories"
                ? "bg-[#fef7e7] text-[#99582a] border-b-2 border-[#99582a]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Users size={16} className="mr-2" /> {t("WorkerCategories")}
          </button>
          <button
            onClick={() => { setActiveTab("roles"); setError(""); setNewName(""); }}
            className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center transition-colors ${
              activeTab === "roles"
                ? "bg-[#fef7e7] text-[#99582a] border-b-2 border-[#99582a]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <UserCog size={16} className="mr-2" /> Custom Roles
          </button>
          <button
            onClick={() => { setActiveTab("permissions"); setError(""); setNewName(""); }}
            className={`flex-1 py-4 px-4 font-bold text-sm flex items-center justify-center transition-colors ${
              activeTab === "permissions"
                ? "bg-[#fef7e7] text-[#99582a] border-b-2 border-[#99582a]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Shield size={16} className="mr-2" /> Permissions
          </button>
        </div>

        {activeTab === "permissions" ? (
          <div className="p-4 md:p-6 bg-gray-50">
            <PermissionsMatrix />
          </div>
        ) : (
          <div className="p-6 md:p-8">
            {/* Add Form */}
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 mb-8">
              {activeTab === "festivals" && (
                <div className="sm:w-48">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                    required
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    activeTab === "festivals"
                      ? "Enter festival name (e.g. Diwali)"
                      : activeTab === "occasions" 
                        ? t("AddOccasionHolder") 
                        : activeTab === "categories"
                          ? t("AddCategoryHolder")
                          : "Enter role name (e.g. KITCHEN_STAFF)"
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#99582a] outline-none font-bold text-gray-800"
                />
                {error && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading || !newName.trim() || (activeTab === "festivals" && !newDate)}
                className="px-6 py-3 bg-[#99582a] text-white font-bold rounded-xl shadow-sm hover:bg-[#78431e] disabled:opacity-50 transition-colors flex items-center whitespace-nowrap h-[52px]"
              >
                <Plus size={18} className="mr-1" /> {t("Add")}
              </button>
            </form>

            {/* List */}
            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                {activeTab === "festivals" ? "Existing Festivals" : activeTab === "occasions" ? t("ExistingOccasions") : activeTab === "categories" ? t("ExistingCategories") : "Existing Roles"}
              </h4>
              
              {currentList.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold">
                  {t("NoRecordsFound")}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentList.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{item.name}</span>
                        {item.date && (
                          <span className="text-xs text-gray-500 mt-0.5">{format(new Date(item.date), "MMMM dd, yyyy")}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={t("Delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
