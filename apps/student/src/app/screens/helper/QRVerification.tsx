import { useNavigate } from "react-router";
import { ArrowLeft, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function QRVerification() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<"scanning" | "success" | "invalid">("scanning");

  useEffect(() => {
    // Simulate scan after 2 seconds
    if (scanState === "scanning") {
      const timer = setTimeout(() => {
        setScanState("success");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col font-sans">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">Scan QR Pass</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-10">
        {scanState === "scanning" ? (
          <div className="w-full max-w-sm">
            <div className="relative aspect-square w-full bg-slate-800 rounded-3xl border-4 border-dashed border-slate-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#22C55E]/20 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
              <QrCode className="w-24 h-24 text-slate-500 opacity-50" />
              {/* Corner brackets */}
              <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-[#22C55E] rounded-tl-xl" />
              <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-[#22C55E] rounded-tr-xl" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-[#22C55E] rounded-bl-xl" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-[#22C55E] rounded-br-xl" />
            </div>
            <p className="text-center text-slate-400 font-bold mt-8 text-lg">Align QR code within frame</p>
          </div>
        ) : scanState === "success" ? (
          <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 shadow-2xl border-2 border-[#22C55E]">
            <div className="w-20 h-20 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-1">Valid Pass</h2>
            <p className="text-[#22C55E] font-bold text-center mb-8 uppercase tracking-widest">Verified</p>
            
            <div className="space-y-4 bg-slate-900/50 rounded-2xl p-4 mb-8 border border-slate-700">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Passenger Name</p>
                <p className="text-white font-bold text-xl">Rafiul Islam</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Student ID</p>
                <p className="text-white font-medium text-lg">CSE-2021-0042</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase">Pass Type</p>
                <p className="text-[#F59E0B] font-bold text-lg">Monthly Subscribed</p>
              </div>
            </div>

            <button 
              onClick={() => setScanState("scanning")}
              className="w-full bg-[#22C55E] text-white py-5 rounded-2xl font-bold text-xl uppercase tracking-wide active:scale-95 transition-transform"
            >
              Scan Next
            </button>
          </div>
        ) : null}
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}