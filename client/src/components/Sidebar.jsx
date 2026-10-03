import { NavLink } from "react-router-dom";
import {
  Users,
  LayoutGrid,
  Heart,
  AlertTriangle,
  Compass,
  PhoneCall,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const NAV_ITEMS = {
  admin: [
    { to: "/admin", label: "Resistance Analytics", icon: LayoutGrid },
    {
      to: "/mentor/escalations",
      label: "Active Escalations",
      icon: AlertTriangle,
    },
    { to: "/explore-careers", label: "Vocational Database", icon: Compass },
  ],
  student: [
    { to: "/me", label: "Family Counselling", icon: Heart },
    { to: "/explore-careers", label: "Explore Careers", icon: Compass },
    { to: "/counsellors", label: "Human Support", icon: PhoneCall },
  ],
  parent: [
    { to: "/me", label: "Family Counselling", icon: Heart },
    { to: "/explore-careers", label: "Explore Careers", icon: Compass },
    { to: "/counsellors", label: "Human Support", icon: PhoneCall },
  ],
  counsellor: [
    { to: "/counsellor", label: "Assigned Families", icon: Users },
    { to: "/mentor/escalations", label: "Escalations", icon: AlertTriangle },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = NAV_ITEMS[user?.role] || NAV_ITEMS.student; // Default to student/parent if none

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-60 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col fixed left-0 top-16 z-40 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.to}
              >
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-inner"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {item.label}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Support Card in Sidebar */}
        <div className="p-4 m-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
            <PhoneCall size={16} /> 24/7 Support
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Stuck in your decision? Our human counsellors are here to help.
          </p>
          <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition">
            Contact Us
          </button>
        </div>
      </aside>
    </>
  );
}
