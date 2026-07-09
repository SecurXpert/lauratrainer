import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, Timer, TrendingUp } from 'lucide-react';

interface ExamsStatsProps {
  totalExams: number;
  activeExams: number;
  upcomingExams: number;
}

const ExamsStats: React.FC<ExamsStatsProps> = ({ totalExams, activeExams, upcomingExams }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 mt-4">
      <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>
        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[50px] h-[50px] rounded-[14px] bg-[#e7efff] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#2563eb]" strokeWidth={2.2} />
            </div>
            <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div>
            <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
              {totalExams}
            </h2>
            <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
              Total Exams
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bbf7d0] rounded-full blur-[40px] opacity-100"></div>
        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[50px] h-[50px] rounded-[14px] bg-[#def7ec] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#10b981]" strokeWidth={2.2} />
            </div>
            <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
              +8%
            </span>
          </div>
          <div>
            <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
              {activeExams}
            </h2>
            <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
              Active Exams
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#fecaca] rounded-full blur-[40px] opacity-100"></div>
        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[50px] h-[50px] rounded-[14px] bg-[#fee2e2] flex items-center justify-center">
              <Timer className="w-6 h-6 text-[#ef4444]" strokeWidth={2.2} />
            </div>
            <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
              +5%
            </span>
          </div>
          <div>
            <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
              {upcomingExams}
            </h2>
            <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
              Upcoming Exams
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#fde68a] rounded-full blur-[40px] opacity-100"></div>
        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-[50px] h-[50px] rounded-[14px] bg-[#fef3c7] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#f59e0b]" strokeWidth={2.2} />
            </div>
            <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
              +5%
            </span>
          </div>
          <div>
            <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
              78%
            </h2>
            <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
              Average Score
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsStats;
