import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";
import { CourseCounts } from './CoursesTypes';

interface CoursesMetricsProps {
  coursesLength: number;
  activeCoursesLength: number;
  counts: CourseCounts;
}

const CoursesMetrics: React.FC<CoursesMetricsProps> = ({ coursesLength, activeCoursesLength, counts }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-8">
      {/* Card 1: Total Courses */}
      <Card className="bg-white border border-slate-100/90 rounded-[20px] sm:rounded-[24px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.02),_0_4px_12px_-2px_rgba(0,0,0,0.01)] relative overflow-hidden bg-[radial-gradient(circle_at_60%_50%,_rgba(124,58,237,0.12),_transparent_65%)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.03)]">
        <CardContent className="p-4 sm:p-5 lg:p-7">
          <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[18px] bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_8px_20px_-2px_rgba(79,70,229,0.35)]">
            <BookOpen className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
          </div>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#64748B] font-medium tracking-tight mb-1">Total Courses</p>
          <p className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">
            {coursesLength}
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Active Courses */}
      <Card className="bg-white border border-slate-100/90 rounded-[20px] sm:rounded-[24px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.02),_0_4px_12px_-2px_rgba(0,0,0,0.01)] relative overflow-hidden bg-[radial-gradient(circle_at_60%_50%,_rgba(124,58,237,0.12),_transparent_65%)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.03)]">
        <CardContent className="p-4 sm:p-5 lg:p-7">
          <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[18px] bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_8px_20px_-2px_rgba(79,70,229,0.35)]">
            <BookOpen className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
          </div>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#64748B] font-medium tracking-tight mb-1">Active Courses</p>
          <p className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">
            {activeCoursesLength}
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Total Enrollments */}
      <Card className="col-span-2 sm:col-span-1 bg-white border border-slate-100/90 rounded-[20px] sm:rounded-[24px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.02),_0_4px_12px_-2px_rgba(0,0,0,0.01)] relative overflow-hidden bg-[radial-gradient(circle_at_60%_50%,_rgba(124,58,237,0.12),_transparent_65%)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.03)]">
        <CardContent className="p-4 sm:p-5 lg:p-7">
          <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[18px] bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_8px_20px_-2px_rgba(79,70,229,0.35)]">
            <FileText className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
          </div>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#64748B] font-medium tracking-tight mb-1">Total Enrollments</p>
          <p className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">
            {counts.totalEnrollments}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesMetrics;
