import { useNavigate } from 'react-router';
import { Phone, Mail, Bus, MapPin, LogOut, Hash } from 'lucide-react';

const helper = {
  name: 'Karim Hossain',
  namebn: 'করিম হোসেন',
  employeeId: 'HLP-2023-0018',
  phone: '+880 1812-654321',
  email: 'karim.hossain@duet.ac.bd',
  assignedBus: '104-B',
  route: 'Campus ↔ Gazipur Chowrasta',
  shift: 'Morning Shift (6:00 AM – 2:00 PM)',
  totalTrips: 312,
  avatar: 'KH',
};

export function HelperProfile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col pb-8">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 bg-slate-900">
        <h1 className="text-white text-2xl font-bold mb-6">My Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#1A3C8F] flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-black">{helper.avatar}</span>
          </div>
          <div>
            <p className="text-white text-xl font-bold">{helper.name}</p>
            <p className="text-slate-400 font-medium">{helper.namebn}</p>
            <span className="mt-1 inline-block bg-[#F59E0B]/20 text-[#F59E0B] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
              {helper.employeeId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
            <p className="text-white text-2xl font-black">{helper.totalTrips}</p>
            <p className="text-slate-400 text-xs font-bold uppercase mt-0.5">Total Trips</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
            <p className="text-[#22C55E] text-2xl font-black">Active</p>
            <p className="text-slate-400 text-xs font-bold uppercase mt-0.5">Status</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <p className="text-[#F59E0B] text-xs font-bold uppercase tracking-wider">Helper Information</p>
          </div>
          {[
            { icon: Hash, label: 'Employee ID', value: helper.employeeId },
            { icon: Bus, label: 'Assigned Bus', value: helper.assignedBus },
            { icon: MapPin, label: 'Route', value: helper.route },
            { icon: Phone, label: 'Phone', value: helper.phone },
            { icon: Mail, label: 'Email', value: helper.email },
            { icon: Bus, label: 'Shift', value: helper.shift },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex items-center gap-4 px-5 py-4 ${i < arr.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
              <item.icon className="w-5 h-5 text-slate-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-xs font-bold uppercase">{item.label}</p>
                <p className="text-white font-semibold text-sm mt-0.5 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/helper', { replace: true })}
          className="w-full h-16 bg-[#EF4444]/10 border-2 border-[#EF4444] text-[#EF4444] rounded-2xl flex items-center justify-center gap-3 font-black text-xl active:scale-95 transition-transform"
        >
          <LogOut className="w-7 h-7" />
          LOGOUT
        </button>
      </div>
    </div>
  );
}
