import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { getRoles } from '../api/setup.api';

export default function StaffManagement() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', username: '', role: 'BOOKING_COORDINATOR', pin: '' });

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/users'),
        getRoles()
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data.map((r: any) => r.name));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
    try {
      await axiosClient.patch(`/users/${id}`, { isActive: !currentStatus });
      fetchData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleResetPin = async (id: string) => {
    const newPin = window.prompt("Enter new PIN for this user (Min 4 digits):");
    if (!newPin || newPin.length < 4) {
      if (newPin !== null) alert("PIN must be at least 4 digits long.");
      return;
    }

    try {
      await axiosClient.patch(`/users/${id}/reset-pin`, { pin: newPin });
      alert("PIN reset successfully!");
    } catch (error) {
      alert("Failed to reset PIN");
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: '', name: '', username: '', role: 'BOOKING_COORDINATOR', pin: '' });
    setShowModal(true);
  };

  const openEditModal = (staff: any) => {
    setIsEditing(true);
    setFormData({ id: staff.id, name: staff.name, username: staff.username, role: staff.role, pin: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.patch(`/users/${formData.id}`, { 
          name: formData.name, 
          username: formData.username, 
          role: formData.role 
        });
      } else {
        if (!formData.pin || formData.pin.length < 4) {
          alert("Please provide a PIN of at least 4 digits.");
          return;
        }
        await axiosClient.post('/users', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to save user");
    }
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied. Super Admin only.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#fef7e7] border border-[#f5e3cd] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4a3b2c] mb-1">{t('StaffManagement')}</h2>
          <p className="text-sm font-medium text-[#8a7662]">{t('StaffDesc')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#99582a] hover:bg-[#824b23] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
        >
          {t('AddStaff')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#ece4da] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t('LoadingStaff')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#ece4da]">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('NameUsername')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('Role')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('Status')}</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4da]">
                {users.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 min-w-[150px]">
                      <p className="font-bold text-[#3d2f23]">{staff.name}</p>
                      <p className="text-xs text-gray-500">@{staff.username}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        staff.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {staff.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {staff.isActive ? t('Active') : t('Inactive')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(staff)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                      >
                        {t('Edit')}
                      </button>
                      <button 
                        onClick={() => handleResetPin(staff.id)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold border border-orange-200 transition-colors"
                      >
                        {t('ResetPIN')}
                      </button>
                      {staff.id !== user.id && (
                        <button 
                          onClick={() => handleToggleStatus(staff.id, staff.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            staff.isActive 
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                              : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                          }`}
                        >
                          {staff.isActive ? t('Deactivate') : t('Activate')}
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

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-[#4a3b2c] mb-4">
              {isEditing ? t('EditStaffMember') : t('AddNewStaff')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('FullName')}</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#99582a]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('Username')}</label>
                <input 
                  type="text" required
                  value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#99582a]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('Role')}</label>
                <select 
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#99582a]/30"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              {!isEditing && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('SecurityPIN')}</label>
                  <input 
                    type="password" required={!isEditing}
                    value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#99582a]/30"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                  {t('Cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-[#99582a] hover:bg-[#824b23] text-white rounded-xl font-bold transition">
                  {isEditing ? t('SaveChanges') : t('CreateStaff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
