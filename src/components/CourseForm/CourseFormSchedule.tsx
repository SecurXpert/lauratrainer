import React, { RefObject } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CourseFormScheduleProps {
  formData: {
    startDate: string;
    duration: string;
  };
  errors: Record<string, string>;
  startDateRef: RefObject<HTMLInputElement>;
  minDate: string;
  maxDate: string;
  onChangeStartDate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDuration: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CourseFormSchedule: React.FC<CourseFormScheduleProps> = ({
  formData,
  errors,
  startDateRef,
  minDate,
  maxDate,
  onChangeStartDate,
  onChangeDuration
}) => {
  return (
    <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-[18px] font-semibold text-[#101828] mb-5 leading-tight">Schedule</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div className="space-y-2">
          <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
            Start Date
          </Label>
          <div className="relative flex items-center">
            {/* Visible display input */}
            <input
              type="text"
              readOnly
              placeholder="DD/MM/YYYY"
              value={formData.startDate
                ? formData.startDate.split("-").reverse().join("/")
                : ""}
              onClick={() => startDateRef.current?.showPicker?.()}
              className={`w-full h-12 pl-4 pr-12 bg-white border ${errors.startDate ? "border-red-500" : "border-slate-200"} rounded-xl text-[17px] text-slate-800 placeholder:text-[14px] placeholder:text-slate-800 placeholder:font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer`}
            />
            {/* Hidden native date picker */}
            <input
              ref={startDateRef}
              type="date"
              name="startDate"
              min={minDate}
              max={maxDate}
              value={formData.startDate}
              onChange={onChangeStartDate}
              className="absolute right-6 bottom-0 opacity-0 pointer-events-none w-0 h-0"
              tabIndex={-1}
            />
            {/* Calendar icon */}
            <div
              className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center cursor-pointer rounded-r-xl"
              onClick={() => startDateRef.current?.showPicker?.()}
            >
              <svg className="w-[18px] h-[18px] text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a3 3 0 013 3v11a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h1V3a1 1 0 011-1zm-2 6a1 1 0 000 2h12a1 1 0 100-2H6z" />
              </svg>
            </div>
          </div>
          {errors.startDate && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.startDate}</p>}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
            Duration
          </Label>
          <Input
            name="duration"
            value={formData.duration}
            onChange={onChangeDuration}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            maxLength={2}
            placeholder="e.g. 6 (in months)"
            className={`w-full h-12 px-4 bg-white border ${errors.duration ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[17px] text-slate-800 placeholder:text-[14px] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 cursor-text`}
          />
          {errors.duration && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.duration}</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseFormSchedule;
