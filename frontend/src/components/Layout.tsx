import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Calendar as CalendarIcon,
  PlusSquare,
  FileText,
  Lock,
  Globe,
  Users,
  UserCheck,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout, allowedScreens } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
  };

  const allNavItems = [
    { id: "HOME", name: t("Home"), path: "/", icon: Home },
    { id: "NEW_BOOKING", name: t("New Booking"), path: "/booking/new", icon: PlusSquare },
    { id: "CALENDAR", name: t("Calendar"), path: "/calendar", icon: CalendarIcon },
    { id: "REPORTS", name: t("Reports"), path: "/reports", icon: FileText },
    { id: "ATTENDANCE", name: t("Attendance"), path: "/attendance", icon: UserCheck },
    { id: "WORKERS", name: t("Workers"), path: "/workers", icon: Users },
    { id: "MANDIR_WORKERS", name: t("MandirWorkers", "Mandir Workers"), path: "/mandir-workers", icon: Users },
    { id: "STAFF", name: t("StaffManagement"), path: "/staff", icon: Users },
    { id: "SETUP", name: t("SystemSetup"), path: "/setup", icon: Settings },
  ];

  const navItems = allNavItems.filter(item => allowedScreens.includes(item.id));

  useEffect(() => {
    if (allowedScreens.length > 0) {
      const currentScreen = allNavItems.find(item => item.path === location.pathname);
      if (currentScreen && !allowedScreens.includes(currentScreen.id)) {
        if (navItems.length > 0) {
          navigate(navItems[0].path, { replace: true });
        }
      }
    }
  }, [allowedScreens, location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-[#fdfbf6]">
      {/* Top Header */}
      <header className="bg-[#99582a] text-white p-4 shadow-md relative z-20">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t("AshramTitle")}</h1>
            <p className="text-xs text-orange-100 mb-2 opacity-90">
              {t("AshramSubtitle")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center text-xs font-bold bg-[#824b23] hover:bg-[#6b3d1d] text-orange-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Globe size={14} className="mr-1" />
              {i18n.language === "en" ? "हिंदी" : "EN"}
            </button>
            <button
              onClick={logout}
              className="bg-white text-[#99582a] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
            >
              {t("Logout")}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-orange-200 opacity-80">
          <div className="flex items-center">
            <Lock size={12} className="mr-1" />
            <span>{t("PrivateSystem")}</span>
          </div>
          <div className="bg-[#78431e] px-2 py-0.5 rounded text-orange-100 text-[10px] tracking-wide">
            {user?.name} ({user?.role.replace("_", " ")})
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[#ece4da] shadow-[4px_0_10px_rgba(0,0,0,0.02)] flex-col z-10">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#fef7e7] text-[#99582a] font-bold shadow-sm border border-[#f5e3cd]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#99582a] font-medium border border-transparent"
                  }`}
                  title={item.name}
                >
                  <Icon
                    size={22}
                    className={isActive ? "stroke-[2.5px]" : "stroke-2"}
                  />
                  <span className="text-[14px]">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#ece4da]">
            <p className="text-[11px] text-center text-gray-400 font-medium">
              {t("VersionInfo")}
            </p>
          </div>
        </aside>

        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#ece4da] z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe overflow-x-auto hide-scrollbar">
        <div className="flex px-1 w-max min-w-full justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[72px] py-2 px-1 space-y-1 transition-colors ${
                  isActive
                    ? "text-[#99582a]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}
                />
                <span
                  className={`text-[10px] text-center w-full truncate px-1 ${isActive ? "font-bold" : "font-medium"}`}
                  title={item.name}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
