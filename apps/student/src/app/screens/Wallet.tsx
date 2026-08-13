import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle, X } from 'lucide-react';

const transactions = [
  { id: 1, type: 'debit', desc: 'Bus 3A — Mirpur → Campus', date: 'Today, 8:30 AM', amount: 15 },
  { id: 2, type: 'credit', desc: 'bKash Top-Up', date: 'Yesterday, 7:00 PM', amount: 200 },
  { id: 3, type: 'debit', desc: 'Bus 5B — Uttara → Campus', date: 'Yesterday, 9:15 AM', amount: 15 },
  { id: 4, type: 'credit', desc: 'bKash Top-Up', date: '4 Jul, 6:45 PM', amount: 500 },
  { id: 5, type: 'debit', desc: 'Bus 2C — Dhanmondi → Campus', date: '4 Jul, 8:45 AM', amount: 20 },
  { id: 6, type: 'debit', desc: 'Bus 3A — Mirpur → Campus', date: '3 Jul, 8:30 AM', amount: 15 },
  { id: 7, type: 'debit', desc: 'Bus 1D — Azimpur → Campus', date: '2 Jul, 8:20 AM', amount: 15 },
  { id: 8, type: 'credit', desc: 'bKash Top-Up', date: '1 Jul, 9:00 AM', amount: 300 },
];

const TOPUP_AMOUNTS = [100, 200, 500, 1000];

type Step = 'home' | 'topup' | 'confirm' | 'success';

export function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(1240);
  const [step, setStep] = useState<Step>('home');
  const [amount, setAmount] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');

  const handleTopUp = () => {
    if (!amount || !bkashNumber) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    setBalance(b => b + Number(amount));
    setStep('success');
  };

  if (step === 'topup') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1A3C8F] px-5 pt-10 pb-6 flex items-center gap-4">
          <button onClick={() => setStep('home')} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">bKash Top-Up</h1>
        </div>

        <div className="px-4 pt-6 space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div>
              <p className="text-gray-500 text-sm mb-2">bKash Number</p>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={bkashNumber}
                onChange={e => setBkashNumber(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base focus:outline-none focus:border-[#1A3C8F]"
              />
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-3">Select Amount</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {TOPUP_AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`h-11 rounded-xl border-2 font-semibold text-sm transition-all ${
                      amount === String(a)
                        ? 'border-[#1A3C8F] bg-[#1A3C8F] text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    ৳{a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount (min ৳50)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base focus:outline-none focus:border-[#1A3C8F]"
              />
            </div>
          </div>

          <button
            onClick={handleTopUp}
            disabled={!amount || !bkashNumber}
            className="w-full h-12 bg-[#1A3C8F] text-white rounded-2xl font-semibold text-base disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-[#1A3C8F] px-5 pt-10 pb-6 flex items-center gap-4">
          <button onClick={() => setStep('topup')} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Confirm Top-Up</h1>
        </div>

        <div className="px-4 pt-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Payment Method</span>
              <span className="text-gray-900 font-semibold">bKash</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm">bKash Number</span>
              <span className="text-gray-900 font-semibold">{bkashNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Amount</span>
              <span className="text-[#1A3C8F] font-bold text-lg">৳{amount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 text-sm">New Balance</span>
              <span className="text-[#1DB954] font-bold text-lg">৳{balance + Number(amount)}</span>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs px-4">
            By confirming, ৳{amount} will be deducted from your bKash account and added to your UniTrack wallet.
          </p>

          <button onClick={handleConfirm} className="w-full h-12 bg-[#1DB954] text-white rounded-2xl font-semibold text-base">
            Confirm & Pay
          </button>
          <button onClick={() => setStep('topup')} className="w-full h-12 border border-gray-200 text-gray-600 rounded-2xl font-medium text-base">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 bg-[#1DB954]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-[#1DB954]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Top-Up Successful!</h2>
        <p className="text-gray-500 mb-1">৳{amount} added to your wallet</p>
        <p className="text-[#1A3C8F] font-bold text-2xl mb-8">New Balance: ৳{balance}</p>
        <button onClick={() => setStep('home')} className="w-full h-12 bg-[#1A3C8F] text-white rounded-2xl font-semibold text-base">
          Back to Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A3C8F] px-5 pt-10 pb-20 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="flex items-center gap-4 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">My Wallet</h1>
        </div>
        <div className="relative">
          <p className="text-white/60 text-sm mb-1">Available Balance</p>
          <p className="text-white font-black" style={{ fontSize: 40 }}>৳{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <button
          onClick={() => setStep('topup')}
          className="w-full bg-[#1DB954] text-white rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/30 font-bold text-base"
        >
          <Plus className="w-5 h-5" /> Top-Up via bKash
        </button>
      </div>

      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold text-base">Transaction History</h2>
          <span className="text-gray-400 text-xs">{transactions.length} transactions</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {transactions.map((tx, i) => (
            <div key={tx.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < transactions.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-[#1DB954]/10' : 'bg-[#1A3C8F]/8'}`}>
                {tx.type === 'credit'
                  ? <ArrowDownLeft className="w-5 h-5 text-[#1DB954]" />
                  : <ArrowUpRight className="w-5 h-5 text-[#1A3C8F]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm font-medium truncate">{tx.desc}</p>
                <p className="text-gray-400 text-xs">{tx.date}</p>
              </div>
              <span className={`font-bold text-sm shrink-0 ${tx.type === 'credit' ? 'text-[#1DB954]' : 'text-gray-900'}`}>
                {tx.type === 'credit' ? '+' : '-'}৳{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
