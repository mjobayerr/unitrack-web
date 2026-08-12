import { useState } from 'react';
import { Search, Edit2, Ban, GraduationCap, Users } from 'lucide-react';

const students = [
  { id: 'CSE-2021-0042', name: 'Rafiul Islam', dept: 'CSE', email: 'rafiul@duet.ac.bd', route: 'Gazipur', balance: 1240, status: 'Active' },
  { id: 'EEE-2022-0118', name: 'Sadia Rahman', dept: 'EEE', email: 'sadia@duet.ac.bd', route: 'Mirpur', balance: 850, status: 'Active' },
  { id: 'ME-2020-0033', name: 'Tanvir Ahmed', dept: 'ME', email: 'tanvir@duet.ac.bd', route: 'Uttara', balance: 420, status: 'Active' },
  { id: 'CE-2023-0201', name: 'Nusrat Jahan', dept: 'CE', email: 'nusrat@duet.ac.bd', route: 'Dhanmondi', balance: 100, status: 'Active' },
  { id: 'CSE-2019-0009', name: 'Hasan Abdullah', dept: 'CSE', email: 'hasan@duet.ac.bd', route: 'Gazipur', balance: 0, status: 'Disabled' },
  { id: 'EEE-2021-0077', name: 'Farhan Kabir', dept: 'EEE', email: 'farhan@duet.ac.bd', route: 'Tongi', balance: 620, status: 'Active' },
];

const helpers = [
  { id: 'HLP-2023-0018', name: 'Karim Hossain', bus: '104-B', route: 'Campus ↔ Gazipur', phone: '01812-654321', status: 'Active' },
  { id: 'HLP-2022-0011', name: 'Rahim Uddin', bus: '101-A', route: 'Mirpur ↔ Campus', phone: '01911-223344', status: 'Active' },
  { id: 'HLP-2021-0005', name: 'Salam Khan', bus: '102-B', route: 'Uttara ↔ Campus', phone: '01712-556677', status: 'Active' },
  { id: 'HLP-2020-0003', name: 'Jamal Hossain', bus: '103-C', route: 'Dhanmondi ↔ Campus', phone: '01611-998877', status: 'Active' },
  { id: 'HLP-2019-0001', name: 'Faruk Mia', bus: '105-D', route: 'Azimpur ↔ Campus', phone: '01811-445566', status: 'On Leave' },
];

type Tab = 'students' | 'helpers';

export function UserManagement() {
  const [tab, setTab] = useState<Tab>('students');
  const [query, setQuery] = useState('');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.id.toLowerCase().includes(query.toLowerCase()) ||
    s.email.toLowerCase().includes(query.toLowerCase())
  );

  const filteredHelpers = helpers.filter(h =>
    h.name.toLowerCase().includes(query.toLowerCase()) ||
    h.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">User Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">{students.length} students · {helpers.length} helpers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#1E293B] border border-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'students' ? 'bg-[#1A3C8F] text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <GraduationCap className="w-4 h-4" /> Students ({students.length})
        </button>
        <button
          onClick={() => setTab('helpers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'helpers' ? 'bg-[#1A3C8F] text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Helpers ({helpers.length})
        </button>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] placeholder-slate-500"
              placeholder="Search by name or ID..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === 'students' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Student', 'ID', 'Route', 'Wallet', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1A3C8F] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{s.name}</p>
                          <p className="text-slate-500 text-xs">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-mono">{s.id}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{s.route}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${s.balance < 50 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>৳{s.balance}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.status === 'Active' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-[#3B82F6] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button className="text-[#EF4444] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                          <Ban className="w-3.5 h-3.5" /> Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Helper', 'ID', 'Bus', 'Route', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredHelpers.map(h => (
                  <tr key={h.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F59E0B]/20 rounded-full flex items-center justify-center text-[#F59E0B] text-xs font-bold shrink-0">
                          {h.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-white text-sm font-medium">{h.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-mono">{h.id}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-bold">{h.bus}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{h.route}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{h.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${h.status === 'Active' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#F59E0B] bg-[#F59E0B]/10'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-[#3B82F6] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button className="text-[#EF4444] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                          <Ban className="w-3.5 h-3.5" /> Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
