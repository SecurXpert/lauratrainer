import { FiAward, FiUsers } from "react-icons/fi";

interface Props {
  badgesCount: number;
  studentsCount: number;
}

export const BadgesStats = ({ badgesCount, studentsCount }: Props) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white shadow-md border border-gray-200 rounded-[20px] px-5 py-6 flex items-start justify-between min-h-[118px]">
        <div>
          <p className="text-[14px] font-medium text-[#6B7280] mb-3">Total Badges</p>
          <p className="text-[29px] leading-none font-bold tracking-[-1px] text-[#111827]">{badgesCount}</p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center text-blue-600 shrink-0">
          <FiAward className="w-5 h-5" />
        </div>
      </div>
      <div className="bg-white shadow-md border border-gray-200 rounded-[20px] px-5 py-6 flex items-start justify-between min-h-[118px]">
        <div>
          <p className="text-[14px] font-medium text-[#6B7280] mb-3">Active Students</p>
          <p className="text-[29px] leading-none font-bold tracking-[-1px] text-[#9333EA]">{studentsCount}</p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center text-purple-600 shrink-0">
          <FiUsers className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
