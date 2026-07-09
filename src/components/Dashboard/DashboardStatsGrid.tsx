import React from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import DashboardStatCard from './DashboardStatCard';

interface DashboardStatsGridProps {
  studentsCount: string | number;
  courseCount: string | number;
  activeExamsCount: string | number;
  avgPerformance: string;
}

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  studentsCount,
  courseCount,
  activeExamsCount,
  avgPerformance
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <DashboardStatCard
        icon={<Users className="w-[20px] h-[20px] stroke-[2.2]" />}
        title="Total Students"
        value={String(studentsCount)}
        change="+12.5% from last month"
        iconStyle={{ 
          background: "linear-gradient(135deg, #615FFF 0%, #AD46FF 100%)",
          boxShadow: "0 8px 16px rgba(97, 95, 255, 0.4)" 
        }}
        chartType="line-purple"
      />
      <DashboardStatCard
        icon={<BookOpen className="w-[20px] h-[20px] stroke-[2.5]" />}
        title="Total Courses"
        value={String(courseCount)}
        change="+8 new courses"
        iconStyle={{ 
          background: "linear-gradient(135deg, #AD46FF 0%, #F6339A 100%)",
          boxShadow: "0 8px 16px rgba(173, 70, 255, 0.4)" 
        }}
        chartType="bar-purple"
      />
      <DashboardStatCard
        icon={<GraduationCap className="w-[20px] h-[20px] stroke-[2.5]" />}
        title="Active Quizzes"
        value={String(activeExamsCount)}
        change="+5 this week"
        iconStyle={{ 
          background: "linear-gradient(135deg, #2B7FFF 0%, #00B8DB 100%)",
          boxShadow: "0 8px 16px rgba(43, 127, 255, 0.4)" 
        }}
        chartType="line-blue"
      />
      <DashboardStatCard
        icon={<TrendingUp className="w-[20px] h-[20px] stroke-[2.5]" />}
        title="Avg Performance"
        value={avgPerformance}
        change="+23.1% growth"
        iconStyle={{ 
          background: "linear-gradient(135deg, #00BC7D 0%, #00BBA7 100%)",
          boxShadow: "0 8px 16px rgba(0, 188, 125, 0.4)" 
        }}
        chartType="line-green"
      />
    </div>
  );
};

export default DashboardStatsGrid;
