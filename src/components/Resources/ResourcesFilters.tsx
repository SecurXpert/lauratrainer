import React from 'react';
import { Filter, Search, Calendar, ChevronDown, RefreshCw } from "lucide-react";
import { Course } from './ResourcesTypes';

interface ResourcesFiltersProps {
  resourceSearch: string;
  setResourceSearch: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  selectedCourseId: string;
  handleCourseSelectForList: (e: any) => void;
  courses: Course[];
  handleReset: () => void;
}

const ResourcesFilters: React.FC<ResourcesFiltersProps> = ({
  resourceSearch, setResourceSearch, dateFilter, setDateFilter,
  selectedCourseId, handleCourseSelectForList, courses, handleReset
}) => {
  return (
    <div className="bg-white rounded-[24px] p-4 sm:p-5 md:p-7 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-3.5 mb-5 md:mb-6">
        <div className="p-2.5 md:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[12px] md:rounded-[14px]">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-[16px] md:text-[18px]">Filters & Search</h3>
          <p className="text-[12px] md:text-[13px] text-gray-400 font-medium mt-0.5">Refine your resource list</p>
        </div>
      </div>

      <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search resources..."
            value={resourceSearch}
            maxLength={30}
            onChange={(e) => setResourceSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
          />
        </div>

        {/* Right Side Group */}
        <div className="grid grid-cols-3 gap-3 lg:flex lg:gap-3 lg:w-auto">
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-3 md:pl-4 pr-9 md:pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-xs md:text-sm font-medium text-gray-600 appearance-none cursor-pointer"
            />
            <Calendar className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={handleCourseSelectForList}
              className="w-full pl-3 md:pl-4 pr-9 md:pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-xs md:text-sm font-medium text-gray-600 appearance-none cursor-pointer"
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
            <ChevronDown className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-8 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-xs md:text-sm font-bold transition-all whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesFilters;
