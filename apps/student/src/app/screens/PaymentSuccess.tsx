import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, Download, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const tripDetails = {
    busNumber: '3A',
    route: 'Mirpur → Campus',
    amount: 15,
    time: new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    date: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    paymentMethod: 'QR Code',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Success Animation */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="w-32 h-32 bg-[#1DB954] rounded-full flex items-center justify-center shadow-2xl"
            >
              <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={2.5} />
            </motion.div>

            {/* Ripple effect */}
            {showConfetti && (
              <>
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-[#1DB954] rounded-full"
                />
                <motion.div
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
                  className="absolute inset-0 bg-[#1DB954] rounded-full"
                />
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500">Your trip has been confirmed</p>
        </motion.div>

        {/* Trip Summary Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-white rounded-[16px] shadow-lg p-6 space-y-4 mb-6"
        >
          {/* Amount */}
          <div className="text-center pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
            <p className="text-4xl text-[#1A3C8F]">৳{tripDetails.amount}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Bus Number</span>
              <span className="text-sm text-gray-900">Bus {tripDetails.busNumber}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Route</span>
              <span className="text-sm text-gray-900">{tripDetails.route}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Time</span>
              <span className="text-sm text-gray-900">{tripDetails.time}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Date</span>
              <span className="text-sm text-gray-900">{tripDetails.date}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Payment Method</span>
              <span className="text-sm text-gray-900">{tripDetails.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Transaction ID</span>
              <span className="text-sm text-gray-900 font-mono">{tripDetails.transactionId}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-6 space-y-3"
      >
        <Button
          onClick={() => {}}
          variant="outline"
          className="w-full border-[#1A3C8F] text-[#1A3C8F] hover:bg-[#1A3C8F]/5 rounded-[12px] h-12"
        >
          <Download className="w-5 h-5 mr-2" />
          View Receipt
        </Button>
        <Button
          onClick={() => navigate('/app')}
          className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] rounded-[12px] h-12"
        >
          <Home className="w-5 h-5 mr-2" />
          Go Home
        </Button>
      </motion.div>
    </div>
  );
}
