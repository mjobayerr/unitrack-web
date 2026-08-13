import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Filter, TrendingDown, Clock, CreditCard, QrCode } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function TransactionHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const transactions = [
    {
      id: 1,
      date: 'Today',
      time: '8:30 AM',
      busNumber: '3A',
      route: 'Mirpur → Campus',
      amount: 15,
      paymentMethod: 'QR',
      status: 'completed',
    },
    {
      id: 2,
      date: 'Yesterday',
      time: '9:15 AM',
      busNumber: '5B',
      route: 'Uttara → Campus',
      amount: 15,
      paymentMethod: 'QR',
      status: 'completed',
    },
    {
      id: 3,
      date: '2 days ago',
      time: '8:45 AM',
      busNumber: '3A',
      route: 'Mirpur → Campus',
      amount: 15,
      paymentMethod: 'Card',
      status: 'completed',
    },
    {
      id: 4,
      date: '3 days ago',
      time: '9:00 AM',
      busNumber: '7C',
      route: 'Gulshan → Campus',
      amount: 15,
      paymentMethod: 'QR',
      status: 'completed',
    },
    {
      id: 5,
      date: '4 days ago',
      time: '8:30 AM',
      busNumber: '3A',
      route: 'Mirpur → Campus',
      amount: 15,
      paymentMethod: 'QR',
      status: 'completed',
    },
    {
      id: 6,
      date: '5 days ago',
      time: '9:30 AM',
      busNumber: '5B',
      route: 'Uttara → Campus',
      amount: 15,
      paymentMethod: 'Card',
      status: 'completed',
    },
    {
      id: 7,
      date: '6 days ago',
      time: '8:15 AM',
      busNumber: '3A',
      route: 'Mirpur → Campus',
      amount: 15,
      paymentMethod: 'QR',
      status: 'completed',
    },
  ];

  const totalSpentThisMonth = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalTripsThisMonth = transactions.length;

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-8 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl">Transaction History</h1>
            <p className="text-white/80 text-sm">Your payment records</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white rounded-[16px] shadow-lg p-6 -mt-12">
          <div className="flex items-center gap-2 mb-4 text-white/80">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm">This Month</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Spent</p>
              <p className="text-3xl">৳{totalSpentThisMonth}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Total Trips</p>
              <p className="text-3xl">{totalTripsThisMonth}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-[12px] text-sm whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-[#1A3C8F] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-[16px] shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                    {transaction.paymentMethod === 'QR' ? (
                      <QrCode className="w-6 h-6 text-[#1A3C8F]" />
                    ) : (
                      <CreditCard className="w-6 h-6 text-[#1A3C8F]" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1">
                      Bus {transaction.busNumber} • {transaction.route}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {transaction.date}, {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-900 mb-1">৳{transaction.amount}</p>
                  <Badge
                    variant="outline"
                    className="bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/20 text-xs"
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {transaction.paymentMethod === 'QR' ? (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>QR Code</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Card</span>
                    </>
                  )}
                </div>
                <button className="text-sm text-[#1A3C8F] hover:underline">
                  View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <button className="w-full text-center text-sm text-gray-500 py-3">
          Load more transactions
        </button>
      </div>
    </div>
  );
}
