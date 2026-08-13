import { useNavigate } from "react-router";
import { Bus, Key, User } from "lucide-react";

export function HelperLogin() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/helper/dashboard");
  };

  return (
    <div className="min-h-full bg-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#F59E0B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F59E0B]/20 mb-6">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Helper Portal</h1>
          <p className="text-slate-400 mt-2 font-medium">UniTrack BD Operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-10">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Helper ID"
                className="w-full bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-400 rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors font-medium"
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="PIN Code"
                className="w-full bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-400 rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-white rounded-2xl py-4 text-xl font-bold shadow-lg shadow-[#F59E0B]/20 transition-all uppercase tracking-wide"
          >
            Start Shift
          </button>
        </form>
      </div>
    </div>
  );
}