import React from 'react';
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { Category } from './CourseFormTypes';

interface CourseFormDetailsProps {
  formData: {
    level: string;
    language: string;
    category_id: string;
    status: string;
  };
  errors: Record<string, string>;
  categories: Category[];
  onSelectChange: (name: string, value: string) => void;
}

const CourseFormDetails: React.FC<CourseFormDetailsProps> = ({
  formData,
  errors,
  categories,
  onSelectChange
}) => {
  return (
    <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-[18px] font-semibold text-[#101828] mb-5 leading-tight">Course Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level */}
        <div className="space-y-2">
          <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
            Level
          </Label>
          <div className="relative">
            <select
              value={formData.level}
              onChange={(e) => onSelectChange("level", e.target.value)}
              className={`w-full h-12 px-4 bg-white border ${errors.level ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
            >
              <option value="" disabled>All Levels</option>
              <option value="basic">Basic</option>
              <option value="midlevel">Midlevel</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {errors.level && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.level}</p>}
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
            Language
          </Label>
          <div className="relative">
            <select
              value={formData.language}
              onChange={(e) => onSelectChange("language", e.target.value)}
              className={`w-full h-12 px-4 bg-white border ${errors.language ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
            >
              <option value="" disabled>All Programming Language</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {errors.language && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.language}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
            Category
          </Label>
          <div className="relative">
            <select
              value={formData.category_id}
              onChange={(e) => onSelectChange("category_id", e.target.value)}
              className={`w-full h-12 px-4 bg-white border ${errors.category_id ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
            >
              <option value="" disabled>All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {errors.category_id && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.category_id}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
            Status
          </Label>
          <div className="relative">
            <select
              value={formData.status}
              onChange={(e) => onSelectChange("status", e.target.value)}
              className={`w-full h-12 px-4 bg-white border ${errors.status ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
            >
              <option value="" disabled>All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {errors.status && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.status}</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseFormDetails;
