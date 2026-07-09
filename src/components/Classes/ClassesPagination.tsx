import React from 'react';

interface ClassesPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
}

export const ClassesPagination: React.FC<ClassesPaginationProps> = ({
  currentPage, totalPages, setCurrentPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNumber = idx + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};
