import React from 'react';
import { BookOpen, Calendar } from 'lucide-react';
import { LiveClass } from './ClassesTypes';
import { getClassStatus } from './ClassesUtils';

interface ClassesStatsProps {
  classes: LiveClass[];
}

export const ClassesStats: React.FC<ClassesStatsProps> = ({ classes }) => {
  const totalClasses = classes.length;
  const upcomingClasses = classes.filter(c => getClassStatus(c.scheduled_at) === 'Active').length;

  const stats = [
    {
      title: 'Total Classes',
      value: totalClasses.toString(),
      icon: BookOpen,
      iconColor: 'text-[#3B82F6]',
      bgColor: 'bg-[#EFF6FF]',
      blurColor: 'bg-[#DBEAFE]'
    },
    {
      title: 'Upcoming Classes',
      value: upcomingClasses.toLocaleString(),
      icon: Calendar,
      iconColor: 'text-[#8B5CF6]',
      bgColor: 'bg-[#F5F3FF]',
      blurColor: 'bg-[#EDE9FE]'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden min-h-[180px]">
          <div className={`absolute -top-16 -right-16 w-[150px] h-[150px] ${stat.blurColor} rounded-full blur-[40px] opacity-100`}></div>
          <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className={`w-12 h-12 rounded-[14px] ${stat.bgColor} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-[32px] font-bold text-[#111827] tracking-tight">{stat.value}</p>
              <p className="text-[14px] font-medium text-[#64748B] mt-1">{stat.title}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium">
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
