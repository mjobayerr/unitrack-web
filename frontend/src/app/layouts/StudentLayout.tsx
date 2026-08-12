import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Map, Wallet, QrCode, UserCircle } from 'lucide-react';

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/app', icon: Home, label: 'Home' },
    { path: '/app/map', icon: Map, label: 'Track' },
    { path: '/app/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/app/pay', icon: QrCode, label: 'QR Pay' },
    { path: '/app/profile', icon: UserCircle, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto relative">
      {/* Content */}
      <div className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-w-[430px] mx-auto">
        <nav className="flex items-center justify-around h-16 px-2">
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
                <span className={`text-xs ${active ? '' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
