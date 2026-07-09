import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ResourcesHeaderProps {
  showForm: boolean;
  setShowForm: (val: boolean) => void;
}

const ResourcesHeader: React.FC<ResourcesHeaderProps> = ({ showForm, setShowForm }) => {
  return (
    <div className="sticky top-0 z-10 bg-gray-50 px-2 md:px-3 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-transparent">
      <div>
        <h1 className="text-[24px] sm:text-[30px] font-bold">Resources</h1>
        <p className="text-[14px] sm:text-[16px] text-[#64748B]">Manage course materials and downloads</p>
      </div>
      <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto justify-center bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white">
        {showForm ? <X className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
        {showForm ? "Close Form" : "Upload Resource"}
      </Button>
    </div>
  );
};

export default ResourcesHeader;
