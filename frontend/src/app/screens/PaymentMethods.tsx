import { useNavigate } from "react-router";
import { ArrowLeft, Plus, CreditCard, Trash2 } from "lucide-react";

export function PaymentMethods() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-[#1A3C8F] px-4 pt-12 pb-4 flex items-center justify-between shrink-0">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white" style={{ fontSize: 18, fontWeight: 600 }}>
          Payment Methods
        </h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E2136E]/10 rounded-full flex items-center justify-center">
              <span className="text-[#E2136E] font-bold text-xs">bKash</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">bKash Account</p>
              <p className="text-sm text-gray-500">01712-***678</p>
            </div>
          </div>
          <button className="p-2 text-red-500 rounded-full hover:bg-red-50 active:bg-red-100">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ED1C24]/10 rounded-full flex items-center justify-center">
              <span className="text-[#ED1C24] font-bold text-xs">Nagad</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Nagad Account</p>
              <p className="text-sm text-gray-500">01712-***678</p>
            </div>
          </div>
          <button className="p-2 text-red-500 rounded-full hover:bg-red-50 active:bg-red-100">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-300 text-gray-600 font-medium active:bg-gray-100">
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>
    </div>
  );
}