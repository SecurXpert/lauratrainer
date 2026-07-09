import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CourseFormHeaderProps {
  isEdit: boolean;
  onBack: () => void;
}

const CourseFormHeader: React.FC<CourseFormHeaderProps> = ({ isEdit, onBack }) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-sm group shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
        </button>
        <div>
          <h1 className="text-[30px] font-bold text-[#101828]">
            {isEdit ? "Edit Course" : "Add New Course"}
          </h1>
          <p className="text-[#6A7282] text-[17px] mt-1 font-inter">
            Create and configure a new course
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseFormHeader;
