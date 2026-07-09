import React from 'react';
import { RefreshCw } from 'lucide-react';
import { FaCalendarDays } from 'react-icons/fa6';
import { toast } from 'sonner';

interface ClassesHeaderProps {
  loading: boolean;
  onRefresh: () => Promise<void>;
  onScheduleClick: () => void;
}

export const ClassesHeader: React.FC<ClassesHeaderProps> = ({ loading, onRefresh, onScheduleClick }) => {
  return (
    <div className="sticky top-0 z-20 bg-gray-50 px-2 md:px-3 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-transparent">
      <div className="min-w-0">
        <h1 className="text-[24px] sm:text-[28px] lg:text-[30px] font-bold">Live Classes Management</h1>
        <p className="text-sm lg:text-[16px] text-[#64748B]">Schedule and manage your upcoming live sessions</p>
      </div>
      <div className="grid grid-cols-2 lg:flex gap-3">
        <button
          onClick={async () => {
            await onRefresh();
            toast.success("Classes refreshed successfully");
          }}
          disabled={loading}
          className="flex justify-center items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 text-[13px] sm:text-[14px] lg:text-base"
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />
          <span className="truncate">{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
        <button
          onClick={onScheduleClick}
          className="flex justify-center items-center gap-2 px-4 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white text-[13px] sm:text-[14px] lg:text-[15px] font-semibold rounded-[14px] shadow-[0_10px_25px_rgba(124,58,237,0.35)] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(124,58,237,0.45)]"
        >
          <FaCalendarDays className="w-4 h-4 shrink-0" />
          <span className="truncate">Schedule Class</span>
        </button>
      </div>
    </div>
  );
};
