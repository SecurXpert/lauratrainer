import React from 'react';
import { Search, ChevronDown, RefreshCw } from 'lucide-react';
import { BsFillCalendar2Fill } from "react-icons/bs";

interface VideosFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  uniqueCourses: (string | number)[];
  availableCourses: any[];
  handleResetFilters: () => void;
}

const VideosFilters: React.FC<VideosFiltersProps> = ({
  searchTerm, setSearchTerm, dateFilter, setDateFilter, courseFilter, setCourseFilter,
  uniqueCourses, availableCourses, handleResetFilters
}) => {
  return (
    <div className="bg-white rounded-[16px] p-4 sm:p-5 shadow-sm border border-gray-200">
      <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            maxLength={30}
            onChange={(e) => setSearchTerm(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
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
              className="w-full pl-3 md:pl-4 pr-9 md:pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-xs md:text-sm font-medium text-gray-700 appearance-none cursor-pointer"
            />
            <BsFillCalendar2Fill className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full pl-3 md:pl-4 pr-9 md:pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-xs md:text-sm font-medium text-gray-700 appearance-none cursor-pointer"
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map(id => {
                const course = availableCourses.find(c => Number(c.id) === Number(id));
                const title = course?.title || course?.name || `Course #${id}`;
                const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                return (
                  <option key={id} value={id.toString()}>
                    {displayTitle} (ID: {id})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-8 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-500 text-xs md:text-sm font-bold transition-all whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideosFilters;
