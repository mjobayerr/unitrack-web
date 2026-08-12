import { useNavigate } from "react-router";
import { Users, QrCode, AlertTriangle, LogOut, Activity, MapPin, Play, Square, User } from "lucide-react";

export function HelperDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col font-sans pb-6">
      {/* Header */}
      <div className="bg-slate-900 px-4 pt-12 pb-5 rounded-b-3xl shadow-lg border-b border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-white text-2xl font-bold">Shift Active</h1>
            <p className="text-[#F59E0B] font-bold flex items-center gap-1 mt-1 text-sm">
              <Activity className="w-4 h-4" /> Live Tracking ON
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/helper/profile')} className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:scale-95 transition-transform">
              <User className="w-6 h-6 text-white" />
            </button>
            <button onClick={() => navigate('/helper')} className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:scale-95 transition-transform">
              <LogOut className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Bus Info */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase">Bus ID: 104-B</p>
              <h2 className="text-white text-lg font-bold mt-0.5">Campus → Gazipur Chowrasta</h2>
            </div>
            <div className="bg-[#22C55E]/20 text-[#22C55E] px-3 py-1 rounded-lg font-black text-xs">
              ON ROUTE
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-700/50 p-2.5 rounded-xl">
            <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span className="font-medium text-sm truncate">Next Stop: Joydebpur Station (2 mins)</span>
          </div>
        </div>
      </div>

      {/* Passenger Stats */}
      <div className="px-4 mt-4 flex gap-3">
        <button onClick={() => navigate('/helper/counter')} className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 border-b-4 border-b-[#1A3C8F] active:scale-95 transition-transform text-left">
          <p className="text-slate-400 font-bold text-xs uppercase">Passengers</p>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-4xl font-black text-white">42</span>
            <span className="text-slate-400 font-bold mb-1">/ 50</span>
          </div>
        </button>
        <button onClick={() => navigate('/helper/counter')} className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 border-b-4 border-b-[#22C55E] active:scale-95 transition-transform text-left">
          <p className="text-slate-400 font-bold text-xs uppercase">Seats Free</p>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-4xl font-black text-[#22C55E]">08</span>
          </div>
        </button>
      </div>

      {/* Trip Controls */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/helper/start-trip')} className="bg-[#22C55E] text-white p-5 rounded-3xl shadow-lg shadow-[#22C55E]/20 active:scale-95 transition-transform flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Play className="w-7 h-7 text-white" />
          </div>
          <span className="font-black text-base uppercase tracking-wide">Start Trip</span>
        </button>
        <button onClick={() => navigate('/helper/end-trip')} className="bg-slate-700 border border-slate-600 text-white p-5 rounded-3xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            <Square className="w-7 h-7 text-white" />
          </div>
          <span className="font-black text-base uppercase tracking-wide">End Trip</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        <button onClick={() => navigate('/helper/qr')} className="w-full bg-[#1A3C8F] text-white p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform shadow-md">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-black text-xl">Scan QR</h3>
            <p className="text-white/70 font-medium text-sm">Verify student & deduct fare</p>
          </div>
        </button>

        <button onClick={() => navigate('/helper/emergency')} className="w-full bg-[#0F172A] border-2 border-[#EF4444] text-[#EF4444] p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform">
          <div className="w-14 h-14 bg-[#EF4444]/10 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-[#EF4444]" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-black text-xl">Emergency</h3>
            <p className="opacity-70 font-medium text-sm">Report delay or breakdown</p>
          </div>
        </button>
      </div>
    </div>
  );
}
