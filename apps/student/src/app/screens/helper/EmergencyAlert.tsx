import { useNavigate } from "react-router";
import { ArrowLeft, AlertTriangle, PenTool as Tool, Clock, ShieldAlert } from "lucide-react";

export function EmergencyAlert() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col font-sans">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold text-center">Emergency & Alerts</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-4 pt-6 pb-8 space-y-6">
        <button className="w-full bg-slate-800 border-2 border-slate-700 hover:border-[#F59E0B] p-6 rounded-3xl flex items-center gap-6 active:scale-95 transition-all text-left">
          <div className="w-16 h-16 bg-[#F59E0B]/20 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">Traffic Delay</h2>
            <p className="text-slate-400 font-medium mt-1">Notify 15+ mins delay</p>
          </div>
        </button>

        <button className="w-full bg-slate-800 border-2 border-slate-700 hover:border-[#F59E0B] p-6 rounded-3xl flex items-center gap-6 active:scale-95 transition-all text-left">
          <div className="w-16 h-16 bg-[#F59E0B]/20 rounded-2xl flex items-center justify-center shrink-0">
            <Tool className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">Breakdown</h2>
            <p className="text-slate-400 font-medium mt-1">Mechanical issue, bus stopped</p>
          </div>
        </button>

        <button className="w-full bg-[#EF4444]/10 border-2 border-[#EF4444] p-6 rounded-3xl flex items-center gap-6 active:scale-95 transition-all text-left mt-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#EF4444] opacity-5 animate-pulse" />
          <div className="w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-lg shadow-[#EF4444]/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-[#EF4444] text-2xl font-black uppercase tracking-wide">SOS Emergency</h2>
            <p className="text-[#EF4444]/80 font-bold mt-1">Immediate assist required</p>
          </div>
        </button>
      </div>
    </div>
  );
}