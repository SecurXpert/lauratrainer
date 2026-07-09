import React from 'react';

interface CourseMaterialsPaginationProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

const CourseMaterialsPagination: React.FC<CourseMaterialsPaginationProps> = ({
  totalPages,
  currentPage,
  setCurrentPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 pt-6 border-t border-slate-200/60">
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:hover:bg-[#F8FAFC] text-slate-700 rounded-xl text-[13px] font-semibold border border-slate-200/40 shadow-sm transition-all"
        >
          Previous
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-[13px] font-bold transition-all ${currentPage === i + 1
                ? 'bg-[#EFF6FF] text-[#2563EB] border border-blue-100/40 shadow-sm'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-slate-600 border border-slate-200/40 shadow-sm'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:hover:bg-[#F8FAFC] text-slate-700 rounded-xl text-[13px] font-semibold border border-slate-200/40 shadow-sm transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CourseMaterialsPagination;
