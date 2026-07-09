import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CurriculumHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-[#F8FAFC] px-2 md:px-3 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-transparent">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Curriculum Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-0">Manage and monitor your Curriculum</p>
      </div>
      <Button
        onClick={() => navigate("/curriculum/new")}
        className="w-full sm:w-auto text-sm font-intern bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-xl px-6 h-11 shadow-[0_8px_16px_-2px_rgba(124,58,237,0.5)] hover:shadow-[0_10px_20px_-2px_rgba(124,58,237,0.6)] transition-all duration-300 flex justify-center items-center"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Curriculum
      </Button>
    </div>
  );
};

export default CurriculumHeader;
