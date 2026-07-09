import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from 'react-router-dom';

interface DashboardAnalyticsProps {
  trendData: any[];
  topCourses: any[];
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ trendData, topCourses }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full mt-4 sm:mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="h-auto sm:h-[406px] bg-white border border-[#F3F4F6] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.04),_0_2px_8px_rgba(0,0,0,0.02)] px-4 sm:px-5 lg:px-7 pt-4 sm:pt-6 lg:pt-7 pb-4 sm:pb-6">
          <h2 className="text-[18px] font-bold text-[#0f172a] mb-4 sm:mb-6">
            Student Performance Trend
          </h2>

          <div className="w-full h-[200px] sm:h-[250px] lg:h-[285px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3e5e8ff"
                  vertical
                  horizontal
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: "#64748B" }}
                  tickLine={{ stroke: "#64748B" }}
                  dy={4}
                />

                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: "#64748B" }}
                  tickLine={{ stroke: "#64748B" }}
                  width={32}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{
                    r: 5.5,
                    fill: "#ffffff",
                    stroke: "#6366f1",
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#ffffff",
                    stroke: "#6366f1",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-auto sm:h-[406px] bg-white border border-[#F3F4F6] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.04),_0_2px_8px_rgba(0,0,0,0.02)] px-4 sm:px-5 lg:px-7 pt-4 sm:pt-6 lg:pt-7 pb-4 sm:pb-6 flex flex-col">
          <h2 className="text-[18px] font-bold text-[#0f172a] mb-4 sm:mb-6">
            Course Popularity
          </h2>

          <div className="space-y-[18px] sm:space-y-[25px] flex-1">
            {topCourses.map((course) => (
              <div key={course.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[14px] font-semibold text-[#364153]">
                    {course.name}
                  </p>
                </div>

                <div className="w-full h-[12px] bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                    style={{ width: course.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-5 sm:pt-6">
            <button
              onClick={() => navigate('/courses')}
              className="w-full py-[8px] rounded-[12px] border border-[#4F46E5] text-[#4F46E5] text-[15px] font-medium bg-transparent hover:bg-[#4F46E5]/5 transition-colors"
            >
              View More Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
