import { useNavigate } from 'react-router';
import { Mail, Phone, GraduationCap, MapPin, LogOut, Bus } from 'lucide-react';

const student = {
  name: 'Rafiul Islam',
  namebn: 'রাফিউল ইসলাম',
  studentId: 'CSE-2021-0042',
  department: 'Computer Science & Engineering',
  university: 'Dhaka University of Engineering & Technology',
  email: 'rafiul.islam@duet.ac.bd',
  phone: '+880 1712-345678',
  address: 'Hall 3, Room 214, Gazipur',
  balance: 1240,
  totalTrips: 147,
  route: 'Gazipur ↔ Campus',
  avatar: 'RI',
};

export function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A3C8F] px-5 pt-10 pb-8">
        <h1 className="text-white text-xl font-bold mb-6">Profile</h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">{student.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-lg font-bold truncate">{student.name}</p>
            <p className="text-white/70 text-sm truncate">{student.namebn}</p>
            <span className="mt-1 inline-block bg-[#1DB954]/20 text-[#1DB954] rounded-full px-2 py-0.5 text-xs font-semibold">
              {student.studentId}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Balance', value: `৳${student.balance.toLocaleString()}` },
            { label: 'Total Trips', value: String(student.totalTrips) },
            { label: 'Route', value: 'Gazipur' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-white text-base font-bold">{s.value}</p>
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
          {[
            { icon: GraduationCap, label: 'University', value: student.university },
            { icon: GraduationCap, label: 'Department', value: student.department },
            { icon: Mail, label: 'Email', value: student.email },
            { icon: Phone, label: 'Phone', value: student.phone },
            { icon: MapPin, label: 'Hall Address', value: student.address },
            { icon: Bus, label: 'Bus Route', value: student.route },
          ].map((item, i, arr) => (
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
          onClick={() => navigate('/', { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-[#EF4444] font-semibold text-sm active:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <div className="h-2" />
      </div>
    </div>
  );
}
