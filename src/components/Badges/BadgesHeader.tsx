import { FaPlus, FaCheckCircle } from "react-icons/fa";

interface Props {
  setIsCreateModalOpen: (val: boolean) => void;
  setIsEvaluateModalOpen: (val: boolean) => void;
  loading: boolean;
  selectedCourseId: string;
  badgesCount: number;
}

export const BadgesHeader = ({ setIsCreateModalOpen, setIsEvaluateModalOpen, loading, selectedCourseId, badgesCount }: Props) => {
  return (
    <div className="sticky top-0 z-20 bg-gray-50 px-2 md:px-3 py-4 -mt-2 md:-mt-3 mb-4 md:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-transparent -mx-2 md:-mx-3">
      <div className="min-w-0">
        <h1 className="text-[24px] sm:text-[28px] lg:text-3xl font-bold text-gray-900 leading-tight">Badges & Achievements</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">Manage student badges and rewards</p>
      </div>
      <div className="grid grid-cols-2 lg:flex gap-3">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={loading}
          className={`px-3 sm:px-5 py-2.5 rounded-[10px] font-medium text-white transition flex items-center justify-center gap-1.5 sm:gap-2 text-[13px] sm:text-[14px] lg:text-base shadow-sm ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          <FaPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Create Badge</span>
        </button>
        <button
          type="button"
          onClick={() => setIsEvaluateModalOpen(true)}
          disabled={loading || !selectedCourseId || badgesCount === 0}
          className={`px-3 sm:px-5 py-2.5 rounded-[10px] font-medium text-white transition flex items-center justify-center gap-1.5 sm:gap-2 text-[13px] sm:text-[14px] lg:text-base shadow-sm ${!selectedCourseId || badgesCount === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          <FaCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Evaluate Student</span>
        </button>
      </div>
    </div>
  );
};
