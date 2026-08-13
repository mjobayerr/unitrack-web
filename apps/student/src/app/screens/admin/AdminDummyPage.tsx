import { Construction } from "lucide-react";

export function AdminDummyPage({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
      <Construction className="w-16 h-16 mb-4 opacity-50" />
      <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-sm">This module is under development.</p>
    </div>
  );
}