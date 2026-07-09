import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CoursesHeaderProps {
  onAddCourse: () => void;
}

const CoursesHeader: React.FC<CoursesHeaderProps> = ({ onAddCourse }) => {
  return (
    <div className="sticky top-0 z-10 bg-gray-50 px-2 md:px-3 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-transparent">
      <div>
        <h1 className="text-[24px] sm:text-[30px] font-bold">Courses Management</h1>
        <p className="text-[14px] sm:text-[16px] text-[#64748B]">Manage and monitor your courses</p>
      </div>
      <Button
        onClick={onAddCourse}
        className="w-full sm:w-auto bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white border-0 shadow-[0_4px_14px_rgba(99,102,241,0.3)] transition-all duration-300 rounded-xl px-5 h-11 font-medium flex justify-center items-center"
      >
        <Plus className="w-5 h-5 mr-2 stroke-[2.5]" />
        Add Course
      </Button>
    </div>
  );
};

export default CoursesHeader;
