import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CourseMaterialsHeaderProps {
  loadingAction: boolean;
  onAddClick: () => void;
}

const CourseMaterialsHeader: React.FC<CourseMaterialsHeaderProps> = ({ loadingAction, onAddClick }) => {
  return (
    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-5 sm:mb-7 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[30px] font-bold">Course Materials</h1>
        <p className="text-[#64748B]">
          Manage learning materials and resources
        </p>
      </div>
      <Button
        onClick={onAddClick}
        className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-[0_10px_22px_rgba(126,58,242,0.35)]"
        disabled={loadingAction}
      >
        <Plus className="h-5 w-5" />
        Add Material
      </Button>
    </div>
  );
};

export default CourseMaterialsHeader;
