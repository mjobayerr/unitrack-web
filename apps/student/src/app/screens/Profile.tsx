import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Phone, GraduationCap, MapPin, LogOut, Bus } from 'lucide-react';
import { useAuth } from '../../lib/auth';

// The backend stores identity, not campus directory data. Map the email domain
// to a display name for the one field it cannot give us; fields with no source
// at all (hall address, assigned route, wallet balance) render as "—" rather
// than inventing a value.
const UNIVERSITY_BY_DOMAIN: Record<string, string> = {
  'ulab.edu.bd': 'University of Liberal Arts Bangladesh',
  'duet.ac.bd': 'Dhaka University of Engineering & Technology',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null; // RequireAuth guarantees a user; this satisfies the type.

  const domain = user.email.split('@').pop() ?? '';
  const university = UNIVERSITY_BY_DOMAIN[domain] ?? domain;
  const studentIdNo = user.student?.student_id_no ?? '—';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const infoRows = [
    { icon: GraduationCap, label: 'University', value: university },
    { icon: GraduationCap, label: 'Department', value: user.student?.department ?? '—' },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone ?? '—' },
    { icon: MapPin, label: 'Hall Address', value: '—' },
    { icon: Bus, label: 'Bus Route', value: '—' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A3C8F] px-5 pt-10 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">Profile</h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">{initials(user.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-lg font-bold truncate">{user.name}</p>
            <p className="text-white/70 text-sm truncate">{user.email}</p>
            <span className="mt-1 inline-block bg-[#1DB954]/20 text-[#1DB954] rounded-full px-2 py-0.5 text-xs font-semibold">
              {studentIdNo}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Balance', value: '৳—' },
            { label: 'Total Trips', value: '—' },
            { label: 'Status', value: user.status === 'active' ? 'Active' : user.status },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-white text-base font-bold capitalize">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Student Info */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[#1A3C8F] text-xs font-semibold uppercase tracking-wider">Student Information</p>
          </div>
          {infoRows.map((item, i, arr) => (
            <div key={item.label} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-[#1A3C8F]/8 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-[#1A3C8F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="text-gray-800 text-sm font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs">UniTrack BD v1.0.0 · DUET Campus</p>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-[#EF4444] font-semibold text-sm active:bg-red-100 transition-colors disabled:opacity-60"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>

        <div className="h-2" />
      </div>
    </div>
  );
}
