import { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

const transactions = [
  { id: 'TXN-001', student: 'Rafiul Islam', studentId: 'CSE-2021-0042', type: 'topup', amount: 200, method: 'bKash', date: '6 Jul 2026, 7:00 PM', balance: 1240 },
  { id: 'TXN-002', student: 'Sadia Rahman', studentId: 'EEE-2022-0118', type: 'fare', amount: 15, method: 'QR', date: '6 Jul 2026, 8:30 AM', balance: 850 },
  { id: 'TXN-003', student: 'Tanvir Ahmed', studentId: 'ME-2020-0033', type: 'fare', amount: 20, method: 'QR', date: '6 Jul 2026, 8:45 AM', balance: 420 },
  { id: 'TXN-004', student: 'Nusrat Jahan', studentId: 'CE-2023-0201', type: 'topup', amount: 500, method: 'bKash', date: '5 Jul 2026, 6:30 PM', balance: 615 },
  { id: 'TXN-005', student: 'Farhan Kabir', studentId: 'EEE-2021-0077', type: 'fare', amount: 15, method: 'QR', date: '5 Jul 2026, 9:15 AM', balance: 620 },
  { id: 'TXN-006', student: 'Rafiul Islam', studentId: 'CSE-2021-0042', type: 'topup', amount: 500, method: 'bKash', date: '4 Jul 2026, 6:45 PM', balance: 1055 },
  { id: 'TXN-007', student: 'Sadia Rahman', studentId: 'EEE-2022-0118', type: 'fare', amount: 15, method: 'QR', date: '4 Jul 2026, 8:30 AM', balance: 865 },
  { id: 'TXN-008', student: 'Tanvir Ahmed', studentId: 'ME-2020-0033', type: 'topup', amount: 300, method: 'bKash', date: '3 Jul 2026, 8:00 AM', balance: 440 },
];

export function WalletTransactions() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'topup' | 'fare'>('all');

  const filtered = transactions.filter(t =>
    (filter === 'all' || t.type === filter) &&
    (t.student.toLowerCase().includes(query.toLowerCase()) ||
     t.id.toLowerCase().includes(query.toLowerCase()) ||
     t.studentId.toLowerCase().includes(query.toLowerCase()))
  );

  const totalTopup = transactions.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0);
  const totalFare = transactions.filter(t => t.type === 'fare').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Top-Ups', value: `৳${totalTopup.toLocaleString()}`, icon: ArrowDownLeft, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
          { label: 'Total Fares Collected', value: `৳${totalFare.toLocaleString()}`, icon: ArrowUpRight, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
          { label: 'Active Wallets', value: '5,820', icon: Wallet, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
        ].map(k => (
          <div key={k.label} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${k.bg} shrink-0`}>
              <k.icon className={`w-6 h-6 ${k.color}`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{k.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] placeholder-slate-500"
              placeholder="Search student or transaction ID..." />
          </div>
          <div className="flex gap-2">
            {(['all', 'topup', 'fare'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-[#1A3C8F] text-white' : 'text-slate-400 hover:text-white'}`}>
                {f === 'all' ? 'All' : f === 'topup' ? 'Top-Ups' : 'Fares'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Transaction', 'Student', 'Type', 'Amount', 'Method', 'Date', 'Balance After'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-300 text-sm font-mono">{tx.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-medium">{tx.student}</p>
                    <p className="text-slate-500 text-xs">{tx.studentId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {tx.type === 'topup'
                        ? <ArrowDownLeft className="w-3.5 h-3.5 text-[#22C55E]" />
                        : <ArrowUpRight className="w-3.5 h-3.5 text-[#3B82F6]" />}
                      <span className={`text-xs font-semibold ${tx.type === 'topup' ? 'text-[#22C55E]' : 'text-[#3B82F6]'}`}>
                        {tx.type === 'topup' ? 'Top-Up' : 'Fare'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${tx.type === 'topup' ? 'text-[#22C55E]' : 'text-white'}`}>
                      {tx.type === 'topup' ? '+' : '-'}৳{tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1A3C8F]/20 text-[#3B82F6]">{tx.method}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{tx.date}</td>
                  <td className="px-6 py-4 text-white font-semibold text-sm">৳{tx.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
