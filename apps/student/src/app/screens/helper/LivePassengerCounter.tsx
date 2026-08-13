import { useNavigate } from "react-router";
import { ArrowLeft, Users, Minus, Plus } from "lucide-react";
import { useState } from "react";

export function LivePassengerCounter() {
  const navigate = useNavigate();
  const [count, setCount] = useState(42);
  const maxCapacity = 50;
  
  const percentage = Math.min(100, Math.round((count / maxCapacity) * 100));

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col font-sans">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">Passenger Count</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="128" cy="128" r="110" fill="none" stroke="#1E293B" strokeWidth="24" />
            <circle 
              cx="128" 
              cy="128" 
              r="110" 
              fill="none" 
              stroke={percentage > 90 ? "#EF4444" : percentage > 70 ? "#F59E0B" : "#22C55E"} 
              strokeWidth="24" 
              strokeDasharray={2 * Math.PI * 110} 
              strokeDashoffset={2 * Math.PI * 110 * (1 - percentage / 100)} 
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="text-center z-10">
            <span className="text-7xl font-black text-white">{count}</span>
            <p className="text-slate-400 font-bold text-lg mt-1">/ {maxCapacity}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 w-full flex items-center justify-between mb-8 shadow-xl">
          <div className="text-center">
            <p className="text-slate-400 font-bold uppercase text-sm">Available</p>
            <p className="text-3xl font-black text-[#22C55E]">{Math.max(0, maxCapacity - count)}</p>
          </div>
          <div className="w-px h-12 bg-slate-700" />
          <div className="text-center">
            <p className="text-slate-400 font-bold uppercase text-sm">Status</p>
            <p className={`text-xl font-bold mt-1 ${percentage > 90 ? "text-[#EF4444]" : percentage > 70 ? "text-[#F59E0B]" : "text-[#22C55E]"}`}>
              {percentage >= 100 ? "FULL" : percentage > 80 ? "NEAR FULL" : "NORMAL"}
            </p>
          </div>
        </div>

        <div className="flex gap-6 w-full">
          <button 
            onClick={() => setCount(Math.max(0, count - 1))}
            className="flex-1 bg-slate-800 text-white rounded-[32px] py-8 flex items-center justify-center active:scale-95 transition-transform shadow-lg border-2 border-slate-700 hover:border-slate-600"
          >
            <Minus className="w-12 h-12 text-[#EF4444]" />
          </button>
          <button 
            onClick={() => setCount(Math.min(maxCapacity * 2, count + 1))}
            className="flex-1 bg-[#22C55E] text-white rounded-[32px] py-8 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#22C55E]/20"
          >
            <Plus className="w-12 h-12 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}