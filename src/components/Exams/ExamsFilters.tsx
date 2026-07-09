import React from 'react';
import { Filter, Search, ChevronDown, RotateCcw } from 'lucide-react';

interface ExamsFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCourse: string;
  setSelectedCourse: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  courses: string[];
}

const ExamsFilters: React.FC<ExamsFiltersProps> = ({
  searchQuery, setSearchQuery, selectedCourse, setSelectedCourse,
  selectedStatus, setSelectedStatus, courses
}) => {
  return (
    <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-200 mb-6 mt-6">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your exam list</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
        {/* Search - Flexible width */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by exam title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
          />
        </div>

        {/* Right Side Group */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCourse('All Courses');
              setSelectedStatus('All Status');
            }}
            className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamsFilters;
