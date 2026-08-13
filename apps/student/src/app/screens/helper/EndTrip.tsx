import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Square, CheckCircle, ChevronLeft, Users, Banknote, Clock } from 'lucide-react';

export function EndTrip() {
  const navigate = useNavigate();
  const [ended, setEnded] = useState(false);

  const summary = { totalPassengers: 42, qrPayments: 38, manualCount: 4, totalRevenue: 630, duration: '52 min', route: 'Campus → Gazipur Chowrasta', busId: '104-B' };

  if (ended) {
    return (
      <div className="min-h-full bg-[#0F172A] flex flex-col px-6 pb-8">
        <div className="pt-12 flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-[#F59E0B]/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#F59E0B]" />
          </div>
        </div>
        <h2 className="text-white text-2xl font-bold text-center mb-1">Trip Ended</h2>
        <p className="text-slate-400 text-center mb-8 font-medium">{summary.route}</p>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 divide-y divide-slate-700 mb-8">
          {[
            { icon: Users, label: 'Total Passengers', value: String(summary.totalPassengers), color: 'text-[#22C55E]' },
            { icon: Banknote, label: 'QR Payments', value: String(summary.qrPayments), color: 'text-[#3B82F6]' },
            { icon: Users, label: 'Manual Count', value: String(summary.manualCount), color: 'text-slate-300' },
            { icon: Banknote, label: 'Total Revenue', value: `৳${summary.totalRevenue}`, color: 'text-[#F59E0B]' },
            { icon: Clock, label: 'Trip Duration', value: summary.duration, color: 'text-slate-300' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-5 py-4">
              <item.icon className="w-5 h-5 text-slate-500 shrink-0" />
              <span className="flex-1 text-slate-400 font-bold text-base">{item.label}</span>
              <span className={`font-black text-xl ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/helper/dashboard')} className="w-full h-16 bg-[#1A3C8F] text-white rounded-3xl text-xl font-black tracking-wide active:scale-95 transition-transform">
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col pb-8">
      <div className="px-4 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate('/helper/dashboard')} className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold">End Trip</h1>
      </div>

      {/* Live Stats */}
      <div className="px-4 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <p className="text-slate-400 font-bold text-xs uppercase mb-1">Total Passengers</p>
            <p className="text-white text-4xl font-black">{summary.totalPassengers}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <p className="text-slate-400 font-bold text-xs uppercase mb-1">Revenue</p>
            <p className="text-[#F59E0B] text-4xl font-black">৳{summary.totalRevenue}</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold text-sm">Bus {summary.busId}</p>
            <p className="text-white font-bold text-base mt-0.5">{summary.route}</p>
          </div>
          <div className="bg-[#22C55E]/20 text-[#22C55E] px-3 py-1.5 rounded-xl font-black text-sm">
            ACTIVE
          </div>
        </div>
      </div>

      <p className="text-center text-slate-500 font-medium px-8 mb-8">
        Ending the trip will stop GPS tracking and submit the trip summary to admin.
      </p>

      <div className="px-4 mt-auto">
        <button
          onClick={() => setEnded(true)}
          className="w-full h-24 bg-[#EF4444] text-white rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-[#EF4444]/30"
        >
          <Square className="w-10 h-10" />
          <span className="text-2xl font-black tracking-wide">END TRIP</span>
        </button>
      </div>
    </div>
  );
}
