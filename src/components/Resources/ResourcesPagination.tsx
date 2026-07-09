import React from 'react';

interface ResourcesPaginationProps {
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
}

const ResourcesPagination: React.FC<ResourcesPaginationProps> = ({
  currentPage, setCurrentPage, totalPages
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
      >
        Previous
      </button>
      <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isSec = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSec
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
      >
        Next
      </button>
    </div>
  );
};

export default ResourcesPagination;
