import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export function SimplePage({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-[#1A3C8F] px-4 pt-12 pb-4 flex items-center justify-between shrink-0">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white" style={{ fontSize: 18, fontWeight: 600 }}>
          {title}
        </h1>
        <div className="w-8" />
      </div>
      <div className="flex-1 p-4 flex items-center justify-center text-gray-400">
        <p>This page is under construction</p>
      </div>
    </div>
  );
}