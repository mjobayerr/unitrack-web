import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function NotificationFeed() {
  const navigate = useNavigate();

  const notifications = [
    { id: 1, type: "success", title: "Passenger Boarded", desc: "QR Scan verified: CSE-2021-0042", time: "2 mins ago" },
    { id: 2, type: "alert", title: "Route Update", desc: "Heavy traffic ahead at Tongi", time: "15 mins ago" },
    { id: 3, type: "info", title: "Shift Started", desc: "Bus 104-B activated successfully", time: "1 hour ago" },
    { id: 4, type: "success", title: "Passenger Boarded", desc: "QR Scan verified: EEE-2022-0105", time: "1 hour ago" },
  ];

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col font-sans">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">Activity Log</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex gap-4 items-start">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              notif.type === 'success' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
              notif.type === 'alert' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
              'bg-[#1A3C8F]/20 text-[#3B82F6]'
            }`}>
              {notif.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
              {notif.type === 'alert' && <AlertCircle className="w-6 h-6" />}
              {notif.type === 'info' && <Info className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{notif.title}</h3>
              <p className="text-slate-400 font-medium mt-1">{notif.desc}</p>
              <p className="text-slate-500 text-sm font-bold mt-2">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}