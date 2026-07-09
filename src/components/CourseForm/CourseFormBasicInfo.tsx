import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CourseFormBasicInfoProps {
  formData: { title: string; description: string };
  errors: Record<string, string>;
  onChangeTitle: (val: string) => void;
  onChangeDescription: (val: string) => void;
}

const CourseFormBasicInfo: React.FC<CourseFormBasicInfoProps> = ({
  formData,
  errors,
  onChangeTitle,
  onChangeDescription
}) => {
  return (
    <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-[19px] font-semibold text-[#101828] mb-5 leading-tight">Basic Information</h2>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
            Course Title
          </Label>
          <Input
            name="title"
            value={formData.title}
            onChange={(e) => onChangeTitle(e.target.value.slice(0, 40))}
            placeholder="Enter course title"
            maxLength={40}
            className={`w-full h-12 px-4 bg-white border ${errors.title ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[17px] text-slate-800 placeholder:text-[17px] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 cursor-text`}
          />
          {errors.title && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
            Description
          </Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={(e) => onChangeDescription(e.target.value.slice(0, 180))}
            rows={5}
            placeholder="Enter course description"
            maxLength={180}
            className={`w-full px-4 py-3 bg-white border ${errors.description ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[17px] text-slate-800 placeholder:text-[17px] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 resize-none min-h-[140px] cursor-text`}
          />
          {errors.description && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseFormBasicInfo;
