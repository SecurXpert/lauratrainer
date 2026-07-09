import React from 'react';
import { Button } from "@/components/ui/button";

interface CoursesPaginationProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

const CoursesPagination: React.FC<CoursesPaginationProps> = ({
  totalPages,
  currentPage,
  setCurrentPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => {
          setCurrentPage((prev) => Math.max(1, prev - 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="px-4 h-10 border-slate-200 text-slate-600 rounded-xl"
      >
        Previous
      </Button>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentPage(idx + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-10 h-10 rounded-xl font-semibold text-[14px] transition-all ${currentPage === idx + 1
                ? 'bg-[#6366F1] text-white shadow-md border-0'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => {
          setCurrentPage((prev) => Math.min(totalPages, prev + 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="px-4 h-10 border-slate-200 text-slate-600 rounded-xl"
      >
        Next
      </Button>
    </div>
  );
};

export default CoursesPagination;
