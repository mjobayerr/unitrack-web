import { Outlet } from "react-router";

export function HelperLayout() {
  return (
    <div className="min-h-screen bg-[#0F172A] font-sans flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-[#0F172A] relative overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}