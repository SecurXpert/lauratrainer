import React from 'react';
import { LuSparkles } from "react-icons/lu";

const ExamManagementHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
      <div className="w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex shrink-0 items-center justify-center shadow-lg shadow-purple-300">
        <LuSparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
      <div>
        <h1 className="text-[24px] sm:text-[30px] font-semibold text-gray-900" style={{ fontWeight: "700" }}>Exam Management</h1>
        <p className="text-[14px] sm:text-[16px] text-gray-500 font-normal">Manage coding questions and create exams</p>
      </div>
    </div>
  );
};

export default ExamManagementHeader;
