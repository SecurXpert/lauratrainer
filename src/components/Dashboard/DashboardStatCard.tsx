import React from 'react';
import DashboardMiniChart from './DashboardMiniChart';

const DashboardStatCard = ({
  icon,
  title,
  value,
  change,
  iconBg,
  iconStyle,
  chartType,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  iconBg?: string;
  iconStyle?: React.CSSProperties;
  chartType: "line-purple" | "bar-purple" | "line-blue" | "line-green";
}) => {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[13px] font-medium text-[#64748B]">{title}</p>
          <h2 className="text-[28px] font-bold text-[#0f172a] leading-tight mt-1.5 mb-1">{value}</h2>
        </div>
        <div
          className={`w-[42px] h-[42px] rounded-[18px] text-white flex items-center justify-center shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.15)] ${iconBg || ""}`}
          style={iconStyle}
        >
          {icon}
        </div>
      </div>

      <DashboardMiniChart type={chartType} />
    </div>
  );
};

export default DashboardStatCard;
