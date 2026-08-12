import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, MapPin, Navigation, ChevronLeft } from 'lucide-react';

export function StartTrip() {
  const navigate = useNavigate();
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'active'>('idle');
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setGpsStatus('locating');
    setTimeout(() => {
      setGpsStatus('active');
      setStarted(true);
    }, 1500);
  };

  if (started && gpsStatus === 'active') {
    return (
      <div className="min-h-full bg-[#0F172A] flex flex-col items-center justify-center px-6 text-center pb-16">
        <div className="w-24 h-24 bg-[#22C55E]/20 rounded-full flex items-center justify-center mb-6">
          <Navigation className="w-12 h-12 text-[#22C55E]" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Trip Started!</h2>
        <p className="text-slate-400 mb-1 font-medium">Bus 104-B • Campus → Gazipur</p>
        <div className="flex items-center gap-2 bg-[#22C55E]/10 rounded-xl px-4 py-2 mt-2 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#22C55E] font-bold">GPS Tracking Active</span>
        </div>
        <button
          onClick={() => navigate('/helper/dashboard')}
          className="w-full h-16 bg-[#22C55E] text-white rounded-3xl text-xl font-black tracking-wide active:scale-95 transition-transform shadow-lg shadow-[#22C55E]/30"
        >
          GO TO DASHBOARD
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
        <h1 className="text-white text-2xl font-bold">Start Trip</h1>
      </div>

      {/* Trip Info */}
      <div className="px-4 mb-6">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
          <div>
            <p className="text-slate-400 font-bold text-sm uppercase">Bus</p>
            <p className="text-white text-2xl font-black mt-1">104-B</p>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-slate-400 font-bold text-sm uppercase mb-1">Route</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F59E0B] shrink-0" />
              <p className="text-white font-bold text-lg">Campus → Gazipur Chowrasta</p>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Status */}
      <div className="px-4 mb-8">
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${gpsStatus === 'locating' ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30' : gpsStatus === 'active' ? 'bg-[#22C55E]/10 border border-[#22C55E]/30' : 'bg-slate-800 border border-slate-700'}`}>
          <Navigation className={`w-6 h-6 shrink-0 ${gpsStatus === 'locating' ? 'text-[#F59E0B] animate-spin' : gpsStatus === 'active' ? 'text-[#22C55E]' : 'text-slate-400'}`} />
          <div>
            <p className={`font-bold ${gpsStatus === 'locating' ? 'text-[#F59E0B]' : gpsStatus === 'active' ? 'text-[#22C55E]' : 'text-slate-300'}`}>
              {gpsStatus === 'idle' ? 'GPS Ready' : gpsStatus === 'locating' ? 'Acquiring GPS...' : 'GPS Active'}
            </p>
            <p className="text-slate-500 text-sm font-medium">
              {gpsStatus === 'idle' ? 'Will activate on trip start' : gpsStatus === 'locating' ? 'Getting your location...' : 'Live tracking enabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="px-4 mt-auto">
        <button
          onClick={handleStart}
          disabled={gpsStatus === 'locating'}
          className="w-full h-24 bg-[#22C55E] text-white rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-[#22C55E]/30 disabled:opacity-60"
        >
          <Play className="w-10 h-10" />
          <span className="text-2xl font-black tracking-wide">{gpsStatus === 'locating' ? 'STARTING...' : 'START TRIP'}</span>
        </button>
      </div>
    </div>
  );
}
