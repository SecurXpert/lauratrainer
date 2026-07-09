import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const StudentActivityChart = ({ totalEnrolledStudents, mainChartData }: { totalEnrolledStudents: number | null, mainChartData: any[] }) => {
  return (
    <div className="bg-white h-[350px] rounded-[20px] px-5 py-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden shrink-0 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900">Student Activity Trend</h2>
          <p className="text-[13px] text-slate-500">
            Total Enrolled Students: <span className="font-bold text-indigo-600">{totalEnrolledStudents !== null ? totalEnrolledStudents.toLocaleString() : "0"}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} dx={-10} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              itemStyle={{ color: "#0F172A", fontWeight: 600 }}
              cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
