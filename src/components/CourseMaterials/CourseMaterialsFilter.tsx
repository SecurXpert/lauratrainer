import React from 'react';
import { Search, Calendar, ChevronDown } from "lucide-react";

interface CourseMaterialsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  setFormCourseId: (id: string) => void;
  courses: any[];
}

const CourseMaterialsFilter: React.FC<CourseMaterialsFilterProps> = ({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  selectedCourseId,
  setSelectedCourseId,
  setFormCourseId,
  courses
}) => {
  return (
    <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-sm border border-slate-100/80 mb-6">
      <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-0 focus:border-slate-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Date Filter & Course Selector */}
        <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-3 lg:w-auto">
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-3 md:pl-4 pr-9 md:pr-10 py-3 md:py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-0 focus:border-slate-200 focus:bg-white transition-colors text-xs md:text-sm font-medium text-slate-700 appearance-none cursor-pointer"
            />
            <Calendar className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setFormCourseId(e.target.value);
              }}
              className="w-full pl-3 md:pl-4 pr-9 md:pr-10 py-3 md:py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-0 focus:border-slate-200 focus:bg-white transition-colors text-xs md:text-sm font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">All Courses</option>
              {courses.map((course) => {
                const title = course.title || `Course #${course.id}`;
                const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                return (
                  <option key={course.id} value={course.id}>
                    {displayTitle} (ID: {course.id})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterialsFilter;
