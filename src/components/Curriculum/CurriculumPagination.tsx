import React from 'react';

interface CurriculumPaginationProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  curriculumLength: number;
}

const CurriculumPagination: React.FC<CurriculumPaginationProps> = ({
  totalPages,
  currentPage,
  setCurrentPage,
  curriculumLength
}) => {
  if (totalPages <= 1 || curriculumLength === 0) return null;

  return (
    <div className="flex justify-center items-center gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
      >
        Previous
      </button>
      <div className="flex items-center gap-1.5">
        {(() => {
          // Show a window of 2 page numbers at a time
          let startPage = currentPage;
          if (startPage + 1 > totalPages) startPage = Math.max(1, totalPages - 1);
          const endPage = Math.min(startPage + 1, totalPages);
          const pages: number[] = [];
          for (let i = startPage; i <= endPage; i++) pages.push(i);

          return pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-[14px] font-bold transition-all ${currentPage === page
                  ? "bg-[#5850EC] text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                }`}
            >
              {page}
            </button>
          ));
        })()}
      </div>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default CurriculumPagination;
