import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Star } from "lucide-react";
import { QuizzesStatsType } from './QuizzesTypes';

interface QuizzesStatsProps {
  stats: QuizzesStatsType;
  statsLoading: boolean;
}

const QuizzesStats: React.FC<QuizzesStatsProps> = ({ stats, statsLoading }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 mb-8">
      {/* Total Quizzes */}
      <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>

        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#e7efff] flex items-center justify-center mb-2 sm:mb-4">
              <BookOpen
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563eb]"
                strokeWidth={2.2}
              />
            </div>

            <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
              {statsLoading ? "—" : stats.totalQuizzes}
            </h2>

            <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
              Total Quizzes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Attempts */}
      <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#e9d5ff] rounded-full blur-[40px] opacity-100"></div>
        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#f3e8ff] flex items-center justify-center mb-2 sm:mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#7c3aed]" strokeWidth={2.2} />
            </div>

            <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
              {statsLoading ? "—" : stats.totalAttempts.toLocaleString()}
            </h2>

            <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
              Total Attempts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Avg Score */}
      <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bbf7d0] rounded-full blur-[40px] opacity-100"></div>

        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#def7ec] flex items-center justify-center mb-2 sm:mb-4">
              <TrendingUp
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]"
                strokeWidth={2.2}
              />
            </div>

            <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
              {statsLoading ? "—" : `${stats.avgScore}%`}
            </h2>

            <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
              Avg Score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Quizzes */}
      <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#fed7aa] rounded-full blur-[40px] opacity-100"></div>

        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#fef3c7] flex items-center justify-center mb-2 sm:mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#f59e0b]" strokeWidth={2.2} />
            </div>

            <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
              {statsLoading ? "—" : stats.activeQuizzes}
            </h2>

            <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
              Active Quizzes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizzesStats;
