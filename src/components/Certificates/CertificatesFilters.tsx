import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { RefreshCw } from "lucide-react";
import { Course } from "./Types";

interface Props {
  searchTerm: string; setSearchTerm: (q: string) => void;
  filterCourseId: string; setFilterCourseId: (id: string) => void;
  date: string; setDate: (d: string) => void;
  statusFilter: string; setStatusFilter: (s: string) => void;
  handleResetFilters: () => void;
  courses: Course[];
}

export const CertificatesFilters = ({ searchTerm, setSearchTerm, filterCourseId, setFilterCourseId, date, setDate, statusFilter, setStatusFilter, handleResetFilters, courses }: Props) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    else if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    setDate(value);
  };

  return (
    <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-200 mb-6 sm:mb-8">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
          <FaSearch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your certificate list</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Top Row: Search & Course */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative w-full sm:flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search certificates..." value={searchTerm} maxLength={20} onChange={(e) => { const val = e.target.value; if (/^[a-zA-Z\s]*$/.test(val)) setSearchTerm(val); }} className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400" />
          </div>

          <div className="relative w-full sm:w-[160px] md:w-[200px] lg:w-[250px]">
            <select value={filterCourseId} onChange={(e) => setFilterCourseId(e.target.value)} className="w-full pl-4 pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-700 appearance-none cursor-pointer">
              <option value="">Select Course</option>
              {courses.map((course) => {
                const title = course.title || course.name || `Course #${course.id}`;
                const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                return (
                  <option key={course.id} value={course.id.toString()}>
                    {displayTitle} (ID: {course.id})
                  </option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>

        {/* Bottom Row: Date, Status, Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <input type="text" value={date} onChange={handleDateChange} placeholder="dd/mm/yyyy" maxLength={10} inputMode="numeric" className="w-full pl-4 pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600" />
            <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-4 pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer">
              <option value="All Status">All Status</option><option value="Issued">Issued</option><option value="Pending">Pending</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

          <button type="button" onClick={handleResetFilters} className="flex items-center justify-center gap-2 px-8 py-3 md:py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap w-full">
            <RefreshCw className="w-4 h-4 shrink-0" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
