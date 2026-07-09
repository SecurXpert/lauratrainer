import { Search, ChevronDown } from "lucide-react";
import { Course } from "./Types";

interface Props {
  searchQuery: string; setSearchQuery: (q: string) => void;
  filterDate: string; setFilterDate: (d: string) => void;
  filterStatus: string; setFilterStatus: (s: string) => void;
  selectedCourseId: string; setSelectedCourseId: (id: string) => void;
  courses: Course[]; loading: boolean;
}

export const BadgesFilters = ({ searchQuery, setSearchQuery, filterDate, setFilterDate, filterStatus, setFilterStatus, selectedCourseId, setSelectedCourseId, courses, loading }: Props) => {
  return (
    <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your badge list</p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search badges..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400" />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer" style={{ colorScheme: "light" }} />
            <button type="button" onClick={(e) => { const w = e.currentTarget.parentElement as HTMLElement; const i = w?.querySelector('input') as HTMLInputElement; if (!i) return; const anyI = i as any; if (typeof anyI.showPicker === "function") anyI.showPicker(); i.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors bg-[#F9FAFB] pl-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg></button>
          </div>
          <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer">
              <option>All Status</option><option>Active</option><option>Inactive</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown className="w-4 h-4" /></div>
          </div>
          <button onClick={() => { setSearchQuery(""); setFilterDate(""); setFilterStatus("All Status"); setSelectedCourseId(""); }} className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto">Reset</button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <label className="block text-[14px] font-semibold text-slate-700 mb-2">Select Course</label>
        <div className="relative w-full sm:w-[350px]">
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-colors text-[15px] font-medium text-slate-700 appearance-none cursor-pointer" disabled={loading || courses.length === 0}>
            <option value="">All Courses</option>
            {courses.map((course) => {
              const title = course.name || course.title || `Course #${course.id}`;
              const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
              return <option key={course.id} value={course.id}>{displayTitle} (ID: {course.id})</option>;
            })}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown className="w-5 h-5" /></div>
        </div>
      </div>
    </div>
  );
};
