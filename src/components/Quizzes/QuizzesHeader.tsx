import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

const QuizzesHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative md:sticky md:top-0 z-20 bg-gray-50 py-4 -mt-2 md:-mt-3 mb-4 sm:mb-5 border-b border-gray-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-[24px] sm:text-[28px] lg:text-[30px] font-bold">Quiz Management</h1>
        <p className="text-sm lg:text-base text-[#64748B]">
          Create and manage all your quizzes
        </p>
      </div>

      <div className="grid grid-cols-3 lg:flex gap-2 sm:gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("/quizzes/bulk-upload")}
          className="h-10 px-3 lg:px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer justify-center"
        >
          <Upload className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">Bulk Upload</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/quizzes/add-question")}
          className="h-10 px-3 lg:px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer justify-center"
        >
          <Plus className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">Add Question</span>
        </Button>

        <Button
          onClick={() => navigate("/quizzes/new")}
          className="h-10 px-4 lg:px-5 rounded-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs sm:text-sm font-medium shadow-[0_10px_22px_rgba(126,58,242,0.35)] flex items-center gap-1 sm:gap-1.5 cursor-pointer justify-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
          <span className="truncate">Create Quiz</span>
        </Button>
      </div>
    </div>
  );
};

export default QuizzesHeader;
