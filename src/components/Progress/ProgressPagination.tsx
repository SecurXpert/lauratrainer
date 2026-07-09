import React from "react";

interface ProgressPaginationProps {
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
}

const ProgressPagination: React.FC<ProgressPaginationProps> = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6 px-1">
      <button
        type="button"
        onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
      >
        Previous
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentPage(i + 1)}
            className={`w-9 h-9 rounded-xl text-[14px] font-bold transition-all ${currentPage === i + 1
                ? "bg-[#5850EC] text-white shadow-sm"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default ProgressPagination;
