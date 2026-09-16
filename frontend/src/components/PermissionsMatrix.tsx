import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllPermissions, updateRolePermissions } from "../api/permission.api";
import { getRoles } from "../api/setup.api";

const SCREENS = [
  "HOME",
  "NEW_BOOKING",
  "CALENDAR",
  "REPORTS",
  "ATTENDANCE",
  "WORKERS",
  "STAFF",
  "SETUP"
];

export default function PermissionsMatrix() {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [permRes, rolesRes] = await Promise.all([
        getAllPermissions(),
        getRoles()
      ]);
      setPermissions(permRes.data.data);
      setRoles(rolesRes.data.data.map((r: any) => r.name));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const hasAccess = (role: string, screen: string) => {
    return permissions.some(p => p.role === role && p.screen === screen);
  };

  const toggleAccess = (role: string, screen: string) => {
    if (hasAccess(role, screen)) {
      setPermissions(permissions.filter(p => !(p.role === role && p.screen === screen)));
    } else {
      setPermissions([...permissions, { role, screen }]);
    }
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      for (const role of roles) {
        const screensForRole = permissions.filter(p => p.role === role).map(p => p.screen);
        await updateRolePermissions(role, screensForRole);
      }
      alert(t("Permissions saved successfully!"));
    } catch (e) {
      alert(t("Failed to save permissions."));
    }
    setSaving(false);
  };

  if (loading) return <div className="p-4">{t("Loading")}</div>;
  if (roles.length === 0) return <div className="p-4 text-gray-500">No custom roles created yet. Add them in the Custom Roles tab.</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ece4da] shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#4a3b2c]">Role Access Matrix</h2>
          <p className="text-sm text-gray-500 mt-1">Configure which screens each role can access. Super Admin always has full access.</p>
        </div>
        <button 
          onClick={savePermissions}
          disabled={saving}
          className="bg-[#99582a] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#824b23] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b border-[#ece4da] bg-gray-50 font-bold text-sm text-gray-500 uppercase">Screen</th>
              {roles.map(role => (
                <th key={role} className="p-3 border-b border-[#ece4da] bg-gray-50 font-bold text-sm text-gray-500 text-center uppercase">
                  {role.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCREENS.map(screen => (
              <tr key={screen} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3 font-bold text-[#3d2f23]">{screen.replace(/_/g, " ")}</td>
                {roles.map(role => (
                  <td key={role} className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={hasAccess(role, screen)}
                      onChange={() => toggleAccess(role, screen)}
                      className="w-5 h-5 accent-[#99582a] cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

