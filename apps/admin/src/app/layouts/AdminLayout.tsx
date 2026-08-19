import { Outlet, useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Map, Users, Bus, AlertOctagon, Route, LogOut, Bell, MapPin } from "lucide-react";
import { useAuth } from "../../lib/auth";

// Only pages backed by a real endpoint. Revenue, ridership, wallet and trip
// history were mock-only screens with no backend and have been removed.
const menu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Live Monitoring", path: "/monitoring", icon: Map },
  { name: "Bus Management", path: "/buses", icon: Bus },
  { name: "GPS History", path: "/history", icon: MapPin },
  { name: "Route Management", path: "/routes", icon: Route },
  { name: "Helpers", path: "/users", icon: Users },
  { name: "Emergency Alerts", path: "/emergency", icon: AlertOctagon },
];

// The dashboard sits at "/", so a startsWith test would light up every item.
// Match "/" exactly and the rest by prefix.
function isActive(pathname: string, path: string): boolean {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPage = menu.find((m) => isActive(location.pathname, m.path));

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const avatar = (user?.name?.[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] border-r border-slate-800 flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-[#1A3C8F] rounded-lg flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">UniTrack BD</span>
            <p className="text-slate-500 text-xs">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-3 pt-2">Navigation</div>
          {menu.map((item) => {
            const active = isActive(location.pathname, item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors font-medium text-sm ${
                  active
                    ? "bg-[#1A3C8F] text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-[#1E293B] border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-white font-semibold text-sm">{currentPage?.name || "Dashboard"}</h2>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#EF4444] rounded-full text-white text-[9px] font-bold flex items-center justify-center">2</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1A3C8F] flex items-center justify-center text-white text-xs font-bold">{avatar}</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
