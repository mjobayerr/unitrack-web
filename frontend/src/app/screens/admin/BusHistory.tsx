import { useState, useRef, useEffect } from "react";
import { Bus, Search, AlertCircle, Loader2, MapPin, Calendar, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";

const mockBuses = [
  { id: "1", name: "Surja Mukhi (BRTC) - DHAKA METRO-BA-11-2034", route: "Mirpur 10 - Campus" },
  { id: "2", name: "Kiron (BRTC) - DHAKA METRO-BA-11-2055", route: "Uttara - Campus" },
  { id: "3", name: "Ananda - DHAKA METRO-BA-12-1001", route: "Farmgate - Campus" },
];

const mockHistoryData = [
  { lat: 23.8103, lng: 90.4125, time: "2024-03-01T08:00:00Z" },
  { lat: 23.8053, lng: 90.4150, time: "2024-03-01T08:05:00Z" },
  { lat: 23.8010, lng: 90.4200, time: "2024-03-01T08:12:00Z" },
  { lat: 23.7950, lng: 90.4215, time: "2024-03-01T08:20:00Z" },
  { lat: 23.7910, lng: 90.4250, time: "2024-03-01T08:25:00Z" },
  { lat: 23.7850, lng: 90.4280, time: "2024-03-01T08:30:00Z" },
  { lat: 23.7800, lng: 90.4300, time: "2024-03-01T08:35:00Z" },
  { lat: 23.7750, lng: 90.4350, time: "2024-03-01T08:40:00Z" },
  { lat: 23.7700, lng: 90.4400, time: "2024-03-01T08:45:00Z" },
];

type ViewState = "idle" | "loading" | "loaded" | "error" | "empty";

export function BusHistory() {
  const [selectedBus, setSelectedBus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [history, setHistory] = useState(mockHistoryData);
  const mapRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        setDimensions({
          width: mapRef.current.clientWidth,
          height: mapRef.current.clientHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [viewState]);

  const handleSearch = () => {
    if (!selectedBus || !fromDate || !toDate) {
      return;
    }
    
    setViewState("loading");
    
    setTimeout(() => {
      // Simulate an empty state if they pick bus 3
      if (selectedBus === "3") {
        setViewState("empty");
      } else {
        setHistory(mockHistoryData);
        setViewState("loaded");
      }
    }, 1000);
  };

  const projectPoint = (lat: number, lng: number) => {
    if (!dimensions.width || !dimensions.height || history.length === 0) return { x: 0, y: 0 };
    
    const padding = 60;
    const minX = Math.min(...history.map(p => p.lng));
    const maxX = Math.max(...history.map(p => p.lng));
    const minY = Math.min(...history.map(p => p.lat));
    const maxY = Math.max(...history.map(p => p.lat));

    const dx = maxX - minX || 0.01;
    const dy = maxY - minY || 0.01;

    return {
      x: padding + ((lng - minX) / dx) * (dimensions.width - padding * 2),
      y: padding + ((maxY - lat) / dy) * (dimensions.height - padding * 2) // Invert Y
    };
  };

  const renderMapPoints = () => {
    if (history.length === 0) return null;

    const points = history.map(p => projectPoint(p.lat, p.lng));
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
    
    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {/* Connection Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#1A3C8F"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80 drop-shadow-md"
        />
        
        {/* Points */}
        {points.map((p, i) => {
          if (i === 0 || i === points.length - 1) return null; // handled separately
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke="#1A3C8F"
              strokeWidth="2"
            />
          );
        })}

        {/* Start Marker */}
        <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
          <circle cx="0" cy="0" r="10" fill="#22C55E" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
          <text x="0" y="-16" textAnchor="middle" fill="#1E293B" fontSize="12" fontWeight="bold" className="bg-white px-1">Start</text>
        </g>

        {/* End Marker */}
        <g transform={`translate(${endPoint.x}, ${endPoint.y})`}>
          <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
          <text x="0" y="-16" textAnchor="middle" fill="#1E293B" fontSize="12" fontWeight="bold" className="bg-white px-1">End</text>
        </g>
      </svg>
    );
  };

  const selectedBusName = mockBuses.find(b => b.id === selectedBus)?.name || "Bus";

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Filters Section */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shrink-0 flex flex-col md:flex-row gap-4 items-end">
        
        {/* Bus Selection */}
        <div className="w-full md:w-1/3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Bus</label>
          <div className="relative">
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-[#1A3C8F] focus:ring-1 focus:ring-[#1A3C8F] transition-all"
            >
              <option value="" disabled>Choose a bus...</option>
              {mockBuses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* From Date */}
        <div className="w-full md:w-1/4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From Time</label>
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1A3C8F] focus:ring-1 focus:ring-[#1A3C8F] transition-all style-calendar-picker"
          />
        </div>

        {/* To Date */}
        <div className="w-full md:w-1/4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To Time</label>
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1A3C8F] focus:ring-1 focus:ring-[#1A3C8F] transition-all style-calendar-picker"
          />
        </div>

        {/* Action */}
        <button
          onClick={handleSearch}
          disabled={!selectedBus || !fromDate || !toDate || viewState === 'loading'}
          className="w-full md:w-auto bg-[#1A3C8F] hover:bg-blue-800 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          {viewState === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          View History
        </button>
      </div>

      {/* Map Content Section */}
      <div className="flex-1 bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden relative min-h-[400px] flex flex-col">
        {viewState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <MapPin className="w-12 h-12 mb-4 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-300 mb-1">No history selected</h3>
            <p className="text-sm max-w-sm">Select a bus and time range to view its historical GPS path.</p>
          </div>
        )}

        {viewState === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-[#1A3C8F] mb-4" />
            <p className="text-sm font-medium">Fetching GPS history data...</p>
          </div>
        )}

        {viewState === 'empty' && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <AlertCircle className="w-12 h-12 mb-4 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-300 mb-1">No GPS history found</h3>
            <p className="text-sm max-w-sm">There is no recorded GPS data for this bus during the selected time period.</p>
          </div>
        )}

        {viewState === 'loaded' && (
          <div className="relative flex-1 flex flex-col w-full h-full bg-[#E5E7EB] dark:bg-[#0F172A]">
            {/* Mock Map Background grid */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#1A3C8F 1px, transparent 1px), linear-gradient(90deg, #1A3C8F 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#1A3C8F 2px, transparent 2px), linear-gradient(90deg, #1A3C8F 2px, transparent 2px)',
                backgroundSize: '100px 100px'
              }}
            />

            {/* Path rendering area */}
            <div ref={mapRef} className="flex-1 w-full h-full relative">
              {renderMapPoints()}
            </div>

            {/* Summary Overlay */}
            <div className="absolute top-4 left-4 bg-white dark:bg-[#1E293B] p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 min-w-[280px]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5 text-[#1A3C8F] dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{selectedBusName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(fromDate), "MMM d, h:mm a")} - {format(new Date(toDate), "h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>{history.length} GPS points recorded</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Zoom Controls Overlay (mock) */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
              <button className="w-10 h-10 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                <span className="text-xl font-medium leading-none">+</span>
              </button>
              <button className="w-10 h-10 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                <span className="text-xl font-medium leading-none">-</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
