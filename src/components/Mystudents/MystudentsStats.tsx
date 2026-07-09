import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";

interface MystudentsStatsProps {
  totalStudents: number;
  activeStudents: number;
}

const MystudentsStats: React.FC<MystudentsStatsProps> = ({ totalStudents, activeStudents }) => {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* Total Students */}
      <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px] sm:h-[200px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>

        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-[10px] sm:rounded-[14px] bg-[#e7efff] flex items-center justify-center mb-3 sm:mb-4 shrink-0">
              <Users
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563eb]"
                strokeWidth={2.2}
              />
            </div>

            <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-1px] sm:tracking-[-2px] text-[#0f172a]">
              {totalStudents}
            </h2>

            <p className="mt-1 text-[12px] sm:text-[14px] font-semibold text-[#64748b]">
              Total Students
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Students */}
      <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px] sm:h-[200px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bbf7d0] rounded-full blur-[40px] opacity-100"></div>
        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-[10px] sm:rounded-[14px] bg-[#def7ec] flex items-center justify-center mb-3 sm:mb-4 shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]" strokeWidth={2.2} />
            </div>

            <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-1px] sm:tracking-[-2px] text-[#0f172a]">
              {activeStudents}
            </h2>

            <p className="mt-1 text-[12px] sm:text-[14px] font-semibold text-[#64748b]">
              Active Students
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MystudentsStats;
