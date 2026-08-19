import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Map, Wallet, QrCode, UserCircle } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/map', icon: Map, label: 'Track' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/pay', icon: QrCode, label: 'QR Pay' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // The nav is a flex sibling of the content, not a fixed overlay: the content
  // scrolls in its own region and the bar always keeps its 64px, so a
  // full-height screen (the map) can never paint over it.
  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-background overflow-hidden">
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="shrink-0 h-16 bg-white border-t border-gray-200 shadow-lg flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? 'text-[#1A3C8F]' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
