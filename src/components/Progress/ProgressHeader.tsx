import React from "react";
import { CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProgressHeaderProps {
  students: any[];
  courses: any[];
  selectedStudentId: string;
  setSelectedStudentId: (val: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (val: string) => void;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  students,
  courses,
  selectedStudentId,
  setSelectedStudentId,
  selectedCourseId,
  setSelectedCourseId,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-[#F5F7FA] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[24px] h-[24px] text-[#2563EB]">
            <rect x="3" y="11" width="4" height="11" rx="1" fill="currentColor" />
            <rect x="9" y="8" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="15" y="5" width="4" height="17" rx="1" fill="currentColor" />
            <path d="M2 14L8 8L12 12L20 4" stroke="#F5F7FA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 14L8 8L12 12L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 4H20V9" stroke="#F5F7FA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 4H20V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <CardTitle className="text-[22px] font-bold text-[#101828]">
          Get Progress
        </CardTitle>
      </div>

      <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-3 w-full">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-full sm:w-[220px] h-[46px] rounded-[14px] bg-[#F9FAFB] border border-[#F3F4F6] text-[#111827] font-medium shadow-none focus:ring-0 [&>span]:text-[#111827]">
            <SelectValue placeholder="All Students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name} (ID: {s.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full sm:w-[220px] h-[46px] rounded-[14px] bg-[#F9FAFB] border border-[#F3F4F6] text-[#111827] font-medium shadow-none focus:ring-0 [&>span]:text-[#111827]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProgressHeader;
