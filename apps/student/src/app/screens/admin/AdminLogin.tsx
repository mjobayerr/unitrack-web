import { useNavigate } from "react-router";
import { Bus, Lock, Mail } from "lucide-react";

export function AdminLogin() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1A3C8F] rounded-2xl flex items-center justify-center mb-4">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 mt-1">UniTrack BD Enterprise</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                placeholder="admin@unitrack.bd"
                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-[#3B82F6]" />
              <span className="text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-[#3B82F6] hover:text-[#60A5FA]">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1A3C8F] hover:bg-[#1e40af] text-white rounded-xl py-3 font-semibold transition-colors mt-4"
          >
            Sign In to Console
          </button>
        </form>
      </div>
    </div>
  );
}