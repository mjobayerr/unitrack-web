import { useNavigate } from 'react-router';
import { Bell, MapPin, Clock, Users, ArrowRight, Zap, TrendingUp, CreditCard } from 'lucide-react';
import { Progress } from '../components/ui/progress';

const recentActivity = [
  { bus: '3A', route: 'Mirpur → Campus', time: 'Today, 8:30 AM', fare: 15 },
  { bus: '5B', route: 'Uttara → Campus', time: 'Yesterday, 9:15 AM', fare: 15 },
  { bus: '2C', route: 'Dhanmondi → Campus', time: 'Mon, 8:45 AM', fare: 20 },
];

export function Home() {
  const navigate = useNavigate();

  const activeBus = { id: '3A', route: 'Mirpur → Campus', eta: 4, seatsAvailable: 12, totalSeats: 40 };
  const nextBus   = { id: '5B', route: 'Uttara → Campus',  eta: 18, seatsAvailable: 24, totalSeats: 40 };

  const seatPct     = (activeBus.seatsAvailable / activeBus.totalSeats) * 100;
  const nextBusPct  = (nextBus.seatsAvailable   / nextBus.totalSeats)   * 100;
  const seatColor   = seatPct > 50 ? '#1DB954' : seatPct > 20 ? '#F59E0B' : '#EF4444';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="relative bg-[#1A3C8F] px-5 pt-10 pb-20 overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-8 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0"
              style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}
            >
              R
            </div>
            <div>
              <p className="text-white/60" style={{ fontSize: 12 }}>{greeting},</p>
              <p className="text-white" style={{ fontSize: 17, fontWeight: 700 }}>Rashid</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
          >
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] rounded-full flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 700 }}>3</span>
          </button>
        </div>

        {/* Balance pill */}
        <div className="relative mt-5 flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
          <div>
            <p className="text-white/60" style={{ fontSize: 11 }}>Wallet Balance</p>
            <p className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>৳1,240</p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center gap-1.5 bg-[#1DB954] rounded-xl px-4 py-2"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Pay Now</span>
          </button>
        </div>
      </div>

      {/* ── Floating active-bus card ── */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* card top bar */}
          <div className="bg-[#1A3C8F] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
              <span className="text-white" style={{ fontSize: 12, fontWeight: 600 }}>LIVE TRACKING</span>
            </div>
            <span className="text-white/60" style={{ fontSize: 11 }}>Updated just now</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400" style={{ fontSize: 11 }}>Next Bus</p>
                <p className="text-gray-900" style={{ fontSize: 20, fontWeight: 800 }}>Bus {activeBus.id}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-gray-500" style={{ fontSize: 12 }}>{activeBus.route}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end bg-[#1DB954]/10 rounded-xl px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span className="text-[#1DB954]" style={{ fontSize: 15, fontWeight: 800 }}>{activeBus.eta} min</span>
                </div>
                <p className="text-gray-400 mt-1" style={{ fontSize: 11 }}>away</p>
              </div>
            </div>

            {/* Seat bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
                  <Users className="w-3.5 h-3.5" />
                  Seats available
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: seatColor }}>
                  {activeBus.seatsAvailable} / {activeBus.totalSeats}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${seatPct}%`, backgroundColor: seatColor }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate('/map')}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#1A3C8F] text-white"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                <MapPin className="w-4 h-4" />
                Track on Map
              </button>
              <button
                onClick={() => navigate(`/seats/${activeBus.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#1A3C8F] text-[#1A3C8F]"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                View Seats
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Next bus compact */}
        <button
          onClick={() => navigate('/map')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>Bus {nextBus.id} • {nextBus.eta} min away</p>
            <p className="text-gray-400 truncate" style={{ fontSize: 12 }}>{nextBus.route}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#1DB954] rounded-full" style={{ width: `${nextBusPct}%` }} />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
          </div>
        </button>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400" style={{ fontSize: 11 }}>Trips this month</p>
              <TrendingUp className="w-4 h-4 text-[#1DB954]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: 24, fontWeight: 800 }}>34</p>
            <p className="text-[#1DB954] mt-0.5" style={{ fontSize: 11 }}>+4 vs last month</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400" style={{ fontSize: 11 }}>Total spent</p>
              <CreditCard className="w-4 h-4 text-[#1A3C8F]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: 24, fontWeight: 800 }}>৳510</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>June 2026</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 700 }}>Recent Trips</p>
            <button
              onClick={() => navigate('/history')}
              className="text-[#1A3C8F] flex items-center gap-0.5"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < recentActivity.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#1A3C8F]/8 flex items-center justify-center shrink-0">
                <span className="text-[#1A3C8F]" style={{ fontSize: 12, fontWeight: 700 }}>{item.bus}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 truncate" style={{ fontSize: 13, fontWeight: 500 }}>{item.route}</p>
                <p className="text-gray-400" style={{ fontSize: 11 }}>{item.time}</p>
              </div>
              <span className="text-gray-900 shrink-0" style={{ fontSize: 13, fontWeight: 600 }}>৳{item.fare}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
