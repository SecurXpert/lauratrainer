import { Search, ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from './Types';

interface Props {
  searchTerm: string; setSearchTerm: (v: string) => void;
  fromDate: string; setFromDate: (v: string) => void;
  toDate: string; setToDate: (v: string) => void;
  courseId: string; setSearchParams: (v: any) => void;
  courses: any[]; handleResetFilters: () => void;
  loading: boolean; students: Student[];
  listPage: number; setListPage: (v: number | ((prev: number) => number)) => void;
  fetchAttendanceDetail: (id: number, name: string) => void;
}

export const AttendanceList = ({ searchTerm, setSearchTerm, fromDate, setFromDate, toDate, setToDate, courseId, setSearchParams, courses, handleResetFilters, loading, students, listPage, setListPage, fetchAttendanceDetail }: Props) => {
  const studentsPerPage = 10;
  const filteredStudents = students.filter(s => s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.student_id.toString().includes(searchTerm));
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  
  return (
    <>
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5 w-full xl:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Search Student</label>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search by Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25))} className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-800">Start Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm cursor-pointer ${!fromDate ? 'text-slate-400/80' : 'text-slate-800'}`} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-800">End Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm cursor-pointer ${!toDate ? 'text-slate-400/80' : 'text-slate-800'}`} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-800">Select Course</label>
            <div className="relative w-full">
              <select value={courseId} onChange={(e) => setSearchParams(e.target.value ? { course_id: e.target.value } : {})} className={`w-full pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm appearance-none cursor-pointer ${!courseId ? 'text-slate-400/80' : 'text-slate-800'}`}>
                <option value="" className="text-slate-400 bg-white">All Courses</option>
                {courses.map(course => <option key={course.id} value={course.id} className="text-slate-800 bg-white">{course.title ? `${course.title} (ID: ${course.id})` : `Course ID: ${course.id}`}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          <div className="w-full sm:col-span-2 lg:col-span-4 xl:col-span-1">
            <button onClick={handleResetFilters} className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-all">Reset</button>
          </div>
        </div>
      </div>
      <div>
        {loading ? <p className="text-center py-10">Loading...</p> : students.length === 0 ? <p className="text-center py-10 text-muted-foreground">No students found</p> : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {filteredStudents.slice((listPage - 1) * studentsPerPage, listPage * studentsPerPage).map(s => {
                const initials = s.student_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={s.student_id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:shadow-[0_4px_25px_-2px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white flex items-center justify-center font-semibold text-[14px] sm:text-[16px] shadow-sm shrink-0">{initials}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800 text-[14px] sm:text-[16px] truncate leading-tight" title={s.student_name}>{s.student_name}</h3>
                        <p className="text-[12px] sm:text-sm text-slate-400 font-medium mt-0.5 truncate">Student Id: {s.student_id}</p>
                      </div>
                    </div>
                    <button onClick={() => fetchAttendanceDetail(s.student_id, s.student_name)} className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(99,102,241,0.15)] w-full lg:w-auto shrink-0 mt-1 lg:mt-0">
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="truncate">View Details</span>
                    </button>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-gray-100 bg-white rounded-2xl shadow-sm">
                <span className="text-sm text-slate-500 font-medium">
                  Showing {((listPage - 1) * studentsPerPage) + 1} to {Math.min(listPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setListPage(prev => Math.max(prev as number - 1, 1))} disabled={listPage === 1} className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold">Previous</Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const start = listPage === totalPages && totalPages > 1 ? listPage - 1 : listPage;
                      return page === start || page === start + 1;
                    })
                    .map(page => (
                    <Button key={page} variant="outline" size="sm" onClick={() => setListPage(page)} className={`w-9 h-9 p-0 flex items-center justify-center rounded-xl font-bold transition-all ${listPage === page ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white border-transparent shadow-sm' : 'text-slate-600 hover:bg-slate-50 border-gray-200'}`}>
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setListPage(prev => Math.min(prev as number + 1, totalPages))} disabled={listPage === totalPages} className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold">Next</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
