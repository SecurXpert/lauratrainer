import { BarChart, Calendar } from "lucide-react";

export const AnalyticsHeader = ({ dateRange, setDateRange }: { dateRange: string, setDateRange: (val: string) => void }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#615FFF] via-[#AD46FF] to-[#155DFC] rounded-[14px] flex items-center justify-center shadow-[0_8px_20px_-5px_rgba(173,70,255,0.5)] shrink-0">
          <BarChart className="w-[26px] h-[26px] text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 text-[13px] mt-1 max-w-[400px]">
            Monitor student performance, course engagement, teaching effectiveness, and learning outcomes from one place.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* <div className="relative">
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 pl-10 pr-4 bg-white border border-slate-200 hover:border-slate-300 rounded-full flex items-center text-[13px] font-medium text-slate-600 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div> */}
      </div>
    </div>
  );
};
