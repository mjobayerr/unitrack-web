import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

export function SeatAvailability() {
  const navigate = useNavigate();
  const { busId } = useParams();

  // Mock seat data - 40 seats (10 rows × 4 seats)
  const [seats] = useState([
    // Row 1
    { id: 1, status: 'taken' },
    { id: 2, status: 'taken' },
    { id: 3, status: 'free' },
    { id: 4, status: 'free' },
    // Row 2
    { id: 5, status: 'taken' },
    { id: 6, status: 'free' },
    { id: 7, status: 'free' },
    { id: 8, status: 'taken' },
    // Row 3
    { id: 9, status: 'free' },
    { id: 10, status: 'free' },
    { id: 11, status: 'taken' },
    { id: 12, status: 'taken' },
    // Row 4
    { id: 13, status: 'free' },
    { id: 14, status: 'taken' },
    { id: 15, status: 'free' },
    { id: 16, status: 'taken' },
    // Row 5
    { id: 17, status: 'free' },
    { id: 18, status: 'free' },
    { id: 19, status: 'taken' },
    { id: 20, status: 'free' },
    // Row 6
    { id: 21, status: 'taken' },
    { id: 22, status: 'free' },
    { id: 23, status: 'free' },
    { id: 24, status: 'taken' },
    // Row 7
    { id: 25, status: 'free' },
    { id: 26, status: 'free' },
    { id: 27, status: 'taken' },
    { id: 28, status: 'free' },
    // Row 8
    { id: 29, status: 'taken' },
    { id: 30, status: 'free' },
    { id: 31, status: 'free' },
    { id: 32, status: 'taken' },
    // Row 9
    { id: 33, status: 'free' },
    { id: 34, status: 'taken' },
    { id: 35, status: 'free' },
    { id: 36, status: 'taken' },
    // Row 10
    { id: 37, status: 'free' },
    { id: 38, status: 'free' },
    { id: 39, status: 'taken' },
    { id: 40, status: 'taken' },
  ]);

  const takenSeats = seats.filter((s) => s.status === 'taken').length;
  const freeSeats = seats.filter((s) => s.status === 'free').length;
  const totalSeats = seats.length;
  const occupancyPercentage = (takenSeats / totalSeats) * 100;

  const getSeatRows = () => {
    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      rows.push(seats.slice(i, i + 4));
    }
    return rows;
  };

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-8 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl">Bus {busId}</h1>
            <p className="text-white/80 text-sm">Mirpur → Campus</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Capacity Card */}
        <div className="bg-white rounded-[16px] shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Seat Capacity</span>
            </div>
            <span className="text-lg text-gray-900">
              {freeSeats}/{totalSeats} available
            </span>
          </div>
          <Progress value={100 - occupancyPercentage} className="h-3" indicatorClassName="bg-[#1DB954]" />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#1DB954] rounded"></div>
              <span className="text-gray-600">Free ({freeSeats})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
              <span className="text-gray-600">Taken ({takenSeats})</span>
            </div>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="bg-white rounded-[16px] shadow-sm p-6">
          <h3 className="text-gray-900 mb-4 text-center">Seat Layout</h3>

          {/* Driver */}
          <div className="flex justify-end mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </div>
          </div>

          {/* Seats */}
          <div className="space-y-3">
            {getSeatRows().map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-3 justify-center">
                {/* Left seats */}
                <div className="flex gap-2">
                  {row.slice(0, 2).map((seat) => (
                    <div
                      key={seat.id}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs transition-all ${
                        seat.status === 'free'
                          ? 'bg-[#1DB954] text-white shadow-md'
                          : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {seat.id}
                    </div>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8"></div>

                {/* Right seats */}
                <div className="flex gap-2">
                  {row.slice(2, 4).map((seat) => (
                    <div
                      key={seat.id}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs transition-all ${
                        seat.status === 'free'
                          ? 'bg-[#1DB954] text-white shadow-md'
                          : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {seat.id}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
            Tap seat numbers are for reference only
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => navigate('/app/pay')}
          className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-14 rounded-[12px]"
          size="lg"
        >
          Pay & Reserve Seat
        </Button>
      </div>
    </div>
  );
}
