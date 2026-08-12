import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Navigation, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export function LiveMap() {
  const navigate = useNavigate();
  const [selectedBus, setSelectedBus] = useState({
    id: '3A',
    route: 'Mirpur → Campus',
    eta: 4,
    seatsAvailable: 12,
    totalSeats: 40,
    currentStop: 'Mirpur 10',
    nextStop: 'Mirpur 11',
  });

  return (
    <div className="h-screen bg-gray-100 relative max-w-[430px] mx-auto">
      {/* Map Container - Mock Map */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Mock map with grid lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A3C8F" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Mock road paths */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 50 450 L 150 350 L 250 250 L 300 150 L 350 80"
            stroke="#1A3C8F"
            strokeWidth="6"
            fill="none"
            opacity="0.3"
            strokeDasharray="12 8"
          />
        </svg>

        {/* Mock bus stops */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-[20%] left-[75%] w-8 h-8 bg-white rounded-full shadow-lg border-4 border-[#1A3C8F] flex items-center justify-center"
        >
          <MapPin className="w-4 h-4 text-[#1A3C8F]" />
        </motion.div>

        <div className="absolute top-[35%] left-[60%] w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-400"></div>
        <div className="absolute top-[52%] left-[45%] w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-400"></div>
        <div className="absolute top-[70%] left-[30%] w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-400"></div>

        {/* Animated Bus Icon */}
        <motion.div
          animate={{
            top: ['82%', '78%', '82%'],
            left: ['15%', '17%', '15%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-12 h-12 bg-[#1A3C8F] rounded-xl shadow-2xl flex items-center justify-center"
        >
          <div className="text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 6v6" />
              <path d="M15 6v6" />
              <path d="M2 12h19.6" />
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1DB954] rounded-full border-2 border-white text-white text-xs flex items-center justify-center">
            {selectedBus.id}
          </div>
        </motion.div>
      </div>

      {/* Top Bar - Back Button */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Navigation className="w-5 h-5 text-[#1A3C8F]" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet - Bus Info */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl p-6 z-20"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

        <div className="space-y-4">
          {/* Bus Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl text-gray-900 mb-1">Bus {selectedBus.id}</h2>
              <p className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {selectedBus.route}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-[#1DB954] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-lg">{selectedBus.eta} min</span>
              </div>
              <p className="text-sm text-gray-500">Arriving</p>
            </div>
          </div>

          {/* Current & Next Stop */}
          <div className="bg-gray-50 rounded-[12px] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Current Stop</p>
                <p className="text-sm text-gray-900">{selectedBus.currentStop}</p>
              </div>
            </div>
            <div className="h-px bg-gray-200 ml-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Next Stop</p>
                <p className="text-sm text-gray-900">{selectedBus.nextStop}</p>
              </div>
            </div>
          </div>

          {/* Seat Info */}
          <div className="flex items-center justify-between bg-[#1DB954]/10 rounded-[12px] p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1DB954]" />
              <span className="text-gray-900">Seats Available</span>
            </div>
            <span className="text-lg text-[#1DB954]">
              {selectedBus.seatsAvailable}/{selectedBus.totalSeats}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => navigate(`/app/seats/${selectedBus.id}`)}
              variant="outline"
              className="flex-1 border-[#1A3C8F] text-[#1A3C8F] hover:bg-[#1A3C8F]/5 rounded-[12px] h-12"
            >
              View Seats
            </Button>
            <Button
              onClick={() => navigate('/app/pay')}
              className="flex-1 bg-[#1A3C8F] hover:bg-[#152f6f] rounded-[12px] h-12"
            >
              Pay & Board
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
