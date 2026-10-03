import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiLogOut,
  FiChevronDown,
  FiBell,
  FiInfo,
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardLayout({
  title,
  subtitle,
  headerIcon: HeaderIcon,
  headerActions,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      api
        .get("/notifications")
        .then((res) => setNotifications(res.data))
        .catch(console.error);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n,
          ),
        );
      } catch (err) {}
    }
    setNotificationsOpen(false);
    if (notification.link) {
      let targetLink = notification.link;
      if (targetLink === "/dashboard") {
        targetLink = ["mentor", "admin", "counsellor"].includes(user?.role)
          ? `/${user.role}`
          : "/me";
      }
      navigate(targetLink);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {}
  };

  const initials = (user?.username || "?")
    .split(/[.\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900 flex flex-col font-sans selection:bg-amber-500/20">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-950 lg:hidden shrink-0"
          >
            <FiMenu size={22} />
          </button>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-slate-950 w-4 h-4" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-950 hidden sm:block">
              KaushalSaarthi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative text-slate-500 hover:text-slate-950 transition p-1"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-amber-700 hover:text-amber-900"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${!n.read ? "bg-amber-50" : ""}`}
                        >
                          <div
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${!n.read ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}
                          >
                            {n.type === "warning" ? (
                              <FiInfo size={14} />
                            ) : (
                              <FiBell size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm mb-0.5 ${!n.read ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}
                            >
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 hover:bg-slate-100 p-1.5 rounded-lg transition text-slate-900"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold capitalize text-slate-700">
                  {user?.role}
                </p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shadow-lg shadow-amber-500/20">
                {initials}
              </div>
              <FiChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50"
              >
                <div className="px-4 py-2.5 border-b border-slate-200 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.username}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {user?.role} Account
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                >
                  <FiLogOut size={14} /> Sign out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-60 flex flex-col min-h-[calc(100vh-4rem)] relative">
          <div className="px-6 sm:px-10 pt-6 sm:pt-8 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                {HeaderIcon && (
                  <div className="p-2 bg-amber-100 rounded-xl border border-amber-200">
                    <HeaderIcon className="text-amber-800 shrink-0" size={24} />
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {title}
                </h1>
              </div>
              {subtitle && (
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-3">{headerActions}</div>
            )}
          </div>
          <main className="px-6 sm:px-10 pt-2 sm:pt-3 pb-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
