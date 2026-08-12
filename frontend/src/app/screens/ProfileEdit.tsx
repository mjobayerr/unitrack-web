import { useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";

export function ProfileEdit() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1A3C8F] px-4 pt-12 pb-4 flex items-center justify-between shrink-0">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white" style={{ fontSize: 18, fontWeight: 600 }}>
          Edit Profile
        </h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" defaultValue="Rafiul Islam" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-[#1A3C8F] focus:border-[#1A3C8F] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Bengali)</label>
            <input type="text" defaultValue="রাফিউল ইসলাম" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-[#1A3C8F] focus:border-[#1A3C8F] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue="rafiul.islam@duet.ac.bd" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-[#1A3C8F] focus:border-[#1A3C8F] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" defaultValue="+880 1712-345678" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-[#1A3C8F] focus:border-[#1A3C8F] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea defaultValue="Hall 3, Room 214, Gazipur" className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-[#1A3C8F] focus:border-[#1A3C8F] outline-none" rows={3} />
          </div>
        </div>

        <button className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1A3C8F] text-white active:bg-[#122A66] transition-colors" style={{ fontWeight: 600, fontSize: 16 }}>
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}