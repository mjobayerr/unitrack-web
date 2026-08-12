import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

type Step = 'qr' | 'scanning' | 'confirmed';

export function QRPayment() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('qr');

  const student = { name: 'Rafiul Islam', id: 'CSE-2021-0042', balance: 1240, fare: 15 };

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <div className="w-28 h-28 bg-[#1DB954]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle className="w-14 h-14 text-[#1DB954]" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Boarding Confirmed!</h2>
        <p className="text-gray-500 mb-1">Fare deducted successfully</p>
        <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-sm border border-gray-100 my-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Passenger</span>
            <span className="text-gray-900 font-semibold">{student.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Student ID</span>
            <span className="text-gray-900 font-semibold">{student.id}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-gray-500">Fare Deducted</span>
            <span className="text-[#EF4444] font-bold">-৳{student.fare}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Remaining Balance</span>
            <span className="text-[#1DB954] font-bold">৳{student.balance - student.fare}</span>
          </div>
        </div>
        <button onClick={() => navigate('/app')} className="w-full max-w-xs h-12 bg-[#1A3C8F] text-white rounded-2xl font-semibold">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] px-5 pt-10 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">QR Boarding</h1>
            <p className="text-white/70 text-sm">Show to bus helper</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* QR Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center">
            {step === 'qr' ? (
              <>
                <div className="w-full aspect-square max-w-[220px] bg-gray-50 rounded-2xl flex items-center justify-center p-4 mb-4">
                  <svg width="192" height="192" viewBox="0 0 200 200">
                    <rect width="200" height="200" fill="white" />
                    <rect x="10" y="10" width="50" height="50" fill="#1A3C8F" />
                    <rect x="20" y="20" width="30" height="30" fill="white" />
                    <rect x="25" y="25" width="20" height="20" fill="#1A3C8F" />
                    <rect x="140" y="10" width="50" height="50" fill="#1A3C8F" />
                    <rect x="150" y="20" width="30" height="30" fill="white" />
                    <rect x="155" y="25" width="20" height="20" fill="#1A3C8F" />
                    <rect x="10" y="140" width="50" height="50" fill="#1A3C8F" />
                    <rect x="20" y="150" width="30" height="30" fill="white" />
                    <rect x="25" y="155" width="20" height="20" fill="#1A3C8F" />
                    {Array.from({ length: 13 }, (_, i) =>
                      Array.from({ length: 13 }, (_, j) => {
                        if ((i < 6 && j < 6) || (i < 6 && j > 7) || (i > 7 && j < 6)) return null;
                        const fill = ((i * 3 + j * 7) % 5 === 0 || (i + j) % 4 === 0);
                        return fill ? <rect key={`${i}-${j}`} x={15 + j * 13} y={15 + i * 13} width="10" height="10" fill="#1A3C8F" /> : null;
                      })
                    )}
                  </svg>
                </div>
                <div className="text-center mb-4">
                  <p className="text-gray-900 font-bold text-lg">{student.name}</p>
                  <p className="text-gray-500 text-sm">{student.id}</p>
                </div>
                <div className="w-full bg-[#1A3C8F]/5 rounded-xl p-3 flex justify-between items-center mb-4">
                  <span className="text-gray-600 text-sm">Single Trip Fare</span>
                  <span className="text-[#1A3C8F] font-bold text-lg">৳{student.fare}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1DB954]/8 rounded-xl px-4 py-2.5 w-full justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                  <span className="text-[#1DB954] text-sm font-semibold">QR Ready for Scanning</span>
                </div>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#1A3C8F] border-t-transparent animate-spin" />
                <p className="text-gray-700 font-semibold">Verifying payment...</p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A3C8F]/8 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#1A3C8F]" />
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Wallet Balance</p>
            <p className="text-gray-900 font-bold">৳{student.balance.toLocaleString()}</p>
          </div>
          <button onClick={() => navigate('/app/wallet')} className="text-[#1A3C8F] text-xs font-semibold">
            Top-Up
          </button>
        </div>

        {step === 'qr' && (
          <button
            onClick={() => { setStep('scanning'); setTimeout(() => setStep('confirmed'), 1500); }}
            className="w-full h-12 bg-[#1DB954] text-white rounded-2xl font-semibold text-base shadow-md shadow-[#1DB954]/20"
          >
            Simulate Scan (Demo)
          </button>
        )}
      </div>
    </div>
  );
}
