import React from 'react';
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurriculumFilterProps {
  students: any[];
  courses: any[];
  selectedStudentId: string;
  setSelectedStudentId: (val: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (val: string) => void;
  handleGetCurriculum: () => void;
  loading: boolean;
}

const CurriculumFilter: React.FC<CurriculumFilterProps> = ({
  students,
  courses,
  selectedStudentId,
  setSelectedStudentId,
  selectedCourseId,
  setSelectedCourseId,
  handleGetCurriculum,
  loading
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F5F7FA] flex items-center justify-center">
          <Search className="w-[14px] h-[14px] sm:w-[24px] sm:h-[20px] text-[#2563EB]" />
        </div>
        <h2 className="text-[20px] sm:text-[22px] font-bold text-[#101828]">
          Fetch Curriculum
        </h2>
      </div>

      <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-3 w-full">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-full sm:w-[220px] h-[42px] rounded-[12px] bg-[#F9FAFB] border border-[#F3F4F6] text-[#111827] font-medium shadow-none focus:ring-0 [&>span]:text-[#111827]">
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.name} (ID: {student.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full sm:w-[220px] h-[42px] rounded-[12px] bg-[#F9FAFB] border border-[#F3F4F6] text-[#111827] font-medium shadow-none focus:ring-0 [&>span]:text-[#111827]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleGetCurriculum}
          disabled={loading}
          className="w-full sm:w-auto h-[42px] px-8 rounded-[12px] bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white font-medium shadow-none whitespace-nowrap border-0 flex justify-center items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Fetch Data
        </Button>
      </div>
    </div>
  );
};

export default CurriculumFilter;
