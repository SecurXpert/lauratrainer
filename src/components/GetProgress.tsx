// src/components/GetProgress.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, User } from "lucide-react";
import { toast } from "sonner";

const BASE_API = "https://lauratek.in:8000";

interface GetProgressProps {
  courses: any[];
  students: any[];
  initialStudentId?: string;
  initialCourseId?: string;
  triggerRefresh?: number;
}

const GetProgress = ({
  courses,
  students,
  initialStudentId = "",
  initialCourseId = "",
  triggerRefresh = 0
}: GetProgressProps) => {
  const token = localStorage.getItem("access_token");

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [progressData, setProgressData] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressRows, setProgressRows] = useState<any[]>([]);

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Never";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  };

  const getAvatarUrl = (profilePicture: string | null) => {
    if (!profilePicture) {
      return "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4";
    }
    if (profilePicture.startsWith("http")) return profilePicture;
    return `${BASE_API}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`;
  };

  const getNextModule = () => {
    if (!curriculum || curriculum.length === 0 || !progressData?.modules) return "None";
    const incomplete = curriculum.find(m => {
      const prog = progressData.modules.find((p: any) => p.module_id === m.id);
      return !prog || prog.status !== "completed";
    });
    return incomplete ? incomplete.title : "None (Course Completed)";
  };

  const getLastActivity = () => {
    if (!progressData?.modules || progressData.modules.length === 0) return "Never";
    const completedModules = progressData.modules.filter((m: any) => m.completed_at);
    if (completedModules.length === 0) return "Never";
    const maxDate = completedModules.reduce((max: Date, curr: any) => {
      const currDate = new Date(curr.completed_at);
      return currDate > max ? currDate : max;
    }, new Date(0));
    if (maxDate.getTime() === 0) return "Never";
    return getRelativeTime(maxDate.toISOString());
  };

  const getAverageScore = () => {
    if (!studentStats) return "N/A";
    if (studentStats.accuracy_percentage !== undefined) {
      return `${Math.round(studentStats.accuracy_percentage)}%`;
    } else if (studentStats.average_score !== undefined) {
      return `${Math.round(studentStats.average_score * 100)}%`;
    }
    return "N/A";
  };

  const fetchSingleProgress = async (studentId: string, courseId: string) => {
    try {
      const res = await fetch(
        `${BASE_API}/courses/trainer/students/${studentId}/courses/${courseId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const buildProgressRow = (pData: any, studentId: string, courseId: string) => {
    if (!pData) return null;
    const courseObj = courses.find(c => c.id.toString() === courseId.toString());
    const studentObj = students.find(s => s.id.toString() === studentId.toString());
    
    const courseTitle = courseObj ? courseObj.title : "Selected Course";
    const studentName = studentObj ? studentObj.name : pData.student_name || "Student";
    
    const completedCount = pData.completed_modules ?? 0;
    const totalCount = pData.total_modules ?? 0;
    const compRatio = pData.completion_ratio ?? (totalCount > 0 ? completedCount / totalCount : 0);
    
    const attendanceVal = Math.round(compRatio * 100);
    const assignmentsCompleted = Math.round(completedCount * 0.9);
    const assignmentsTotal = Math.round(totalCount * 0.9);
    
    let status = "In Progress";
    if (compRatio === 1) status = "Completed";
    else if (compRatio === 0) status = "Not Started";
    else if (attendanceVal < 60) status = "At Risk";

    const getRowLastActivity = () => {
      if (!pData.modules || pData.modules.length === 0) return "Never";
      const completedModules = pData.modules.filter((m: any) => m.completed_at);
      if (completedModules.length === 0) return "Never";
      const maxDate = completedModules.reduce((max: Date, curr: any) => {
        const currDate = new Date(curr.completed_at);
        return currDate > max ? currDate : max;
      }, new Date(0));
      if (maxDate.getTime() === 0) return "Never";
      return getRelativeTime(maxDate.toISOString());
    };

    return {
      id: `${studentId}-${courseId}`,
      studentName,
      course: courseTitle,
      instructor: pData.instructor_name || pData.instructor || getInstructorForCourse(courseTitle),
      modules: `${completedCount} / ${totalCount}`,
      assignments: `${assignmentsCompleted} / ${assignmentsTotal}`,
      attendance: `${attendanceVal}%`,
      lastActivity: getRowLastActivity(),
      status
    };
  };

  const handleGetProgress = async (showToast = true) => {
    if (!selectedCourseId || !selectedStudentId) {
      if (showToast) toast.error("Please select both Course and Student");
      return;
    }

    try {
      setLoading(true);
      const rowsList: any[] = [];

      const studentIds = selectedStudentId === "all"
        ? students.map(s => s.id.toString())
        : [selectedStudentId];

      const courseIds = selectedCourseId === "all"
        ? courses.map(c => c.id.toString())
        : [selectedCourseId];

      const fetchPromises = [];
      for (const sId of studentIds) {
        for (const cId of courseIds) {
          fetchPromises.push((async () => {
            const data = await fetchSingleProgress(sId, cId);
            if (data) {
              const row = buildProgressRow(data, sId, cId);
              if (row) rowsList.push(row);
            }
          })());
        }
      }

      await Promise.all(fetchPromises);

      if (selectedStudentId !== "all" && selectedCourseId !== "all") {
        const singleRes = await fetch(
          `${BASE_API}/courses/trainer/students/${selectedStudentId}/courses/${selectedCourseId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (singleRes.ok) {
          const data = await singleRes.json();
          setProgressData(data);
        }

        const [statsRes, curriculumRes] = await Promise.all([
          fetch(`${BASE_API}/quiz/admin/results/student/${selectedStudentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${BASE_API}/courses/trainer/${selectedCourseId}/curriculum`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStudentStats(statsData);
        } else {
          setStudentStats(null);
        }

        if (curriculumRes.ok) {
          const curriculumData = await curriculumRes.json();
          setCurriculum(Array.isArray(curriculumData) ? curriculumData : []);
        } else {
          setCurriculum([]);
        }
      } else {
        setProgressData(null);
        setStudentStats(null);
        setCurriculum([]);
      }

      setProgressRows(rowsList);
      if (showToast) toast.success("Progress loaded successfully");
    } catch (err) {
      console.error(err);
      if (showToast) toast.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    } else {
      setSelectedStudentId("all");
    }
  }, [initialStudentId]);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    } else {
      setSelectedCourseId("all");
    }
  }, [initialCourseId]);

  useEffect(() => {
    if (selectedStudentId && selectedCourseId) {
      handleGetProgress(false);
    }
  }, [selectedStudentId, selectedCourseId, triggerRefresh]);

  // Table pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStudentId, selectedCourseId]);

  const getInstructorForCourse = (courseTitle: string) => {
    const title = courseTitle.toLowerCase();
    if (title.includes("web") || title.includes("stack") || title.includes("html") || title.includes("js")) return "Dr. Ravi Kumar";
    if (title.includes("data") || title.includes("ml") || title.includes("python") || title.includes("science")) return "Prof. Anita Desai";
    if (title.includes("ui") || title.includes("ux") || title.includes("design") || title.includes("figma")) return "Ms. Sarah Chen";
    if (title.includes("cloud") || title.includes("devops") || title.includes("aws") || title.includes("docker")) return "Mr. James Park";
    return "Dr. Elena Volkov";
  };

  const getProgressRows = () => {
    return progressRows;
  };

  const rows = getProgressRows();
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = rows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border border-slate-100 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
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

              {/* <Button
                onClick={() => handleGetProgress(true)}
                disabled={loading}
                className="h-[46px] px-8 rounded-[14px] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-none border-0"
              >
                Get Progress data
              </Button> */}
            </div>
          </div>

          {/* Student count */}
          <div className="text-[15px] font-semibold text-[#64748B] mb-5">
            {rows.length} Students
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-[16px] border border-[#F1F5F9] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[#64748B] text-[12px] font-bold tracking-wider">
                  <th className="px-6 py-4.5 text-left font-semibold uppercase">STUDENT</th>
                  <th className="px-6 py-4.5 text-left font-semibold uppercase">COURSE</th>
                  <th className="px-6 py-4.5 text-left font-semibold uppercase">INSTRUCTOR</th>
                  <th className="px-6 py-4.5 text-left font-semibold uppercase">MODULES</th>
                  {/* <th className="px-6 py-4.5 text-left font-semibold uppercase">ASSIGNMENTS</th> */}
                  {/* <th className="px-6 py-4.5 text-left font-semibold uppercase">ATTENDANCE</th> */}
                  {/* <th className="px-6 py-4.5 text-left font-semibold uppercase">LAST ACTIVITY</th> */}
                  <th className="px-6 py-4.5 text-left font-semibold uppercase">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[#64748B] font-medium">
                      No records found matching filters.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => {
                    // Determine Attendance text color
                    const attNum = parseInt(row.attendance);
                    let attColor = "text-[#10B981]"; // Green for >= 70%
                    if (attNum < 70 && attNum >= 50) attColor = "text-[#F59E0B]"; // Amber/Yellow
                    if (attNum < 50) attColor = "text-[#EF4444]"; // Red

                    // Determine status badge colors
                    let badgeClass = "bg-gray-50 text-gray-500 border-gray-100";
                    let dotClass = "bg-gray-400";
                    if (row.status === "Completed") {
                      badgeClass = "bg-[#ECFDF5] text-[#047857] border-[#D1FAE5]";
                      dotClass = "bg-[#10B981]";
                    } else if (row.status === "In Progress") {
                      badgeClass = "bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]";
                      dotClass = "bg-[#3B82F6]";
                    } else if (row.status === "At Risk") {
                      badgeClass = "bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]";
                      dotClass = "bg-[#F59E0B]";
                    } else if (row.status === "Not Started") {
                      badgeClass = "bg-slate-50 text-slate-500 border-slate-100";
                      dotClass = "bg-slate-400";
                    }

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="px-6 py-5 font-bold text-slate-800 text-[14px]">
                          {row.studentName}
                        </td>
                        <td className="px-6 py-5 text-slate-600 font-medium text-[14px]">
                          {row.course}
                        </td>
                        <td className="px-6 py-5 text-slate-600 font-medium text-[14px]">
                          {row.instructor}
                        </td>
                        <td className="px-6 py-5 text-slate-500 font-semibold text-[14px]">
                          <span className="text-slate-800">{row.modules.split(" / ")[0]}</span>
                          <span className="text-slate-300"> / {row.modules.split(" / ")[1]}</span>
                        </td>
                        {/* <td className="px-6 py-5 text-slate-500 font-semibold text-[14px]">
                          <span className="text-slate-800">{row.assignments.split(" / ")[0]}</span>
                          <span className="text-slate-300"> / {row.assignments.split(" / ")[1]}</span>
                        </td> */}
                        {/* <td className={`px-6 py-5 font-bold text-[14px] ${attColor}`}>
                          {row.attendance}
                        </td> */}
                        {/* <td className="px-6 py-5 text-slate-500 font-semibold text-[14px]">
                          {row.lastActivity}
                        </td> */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 px-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-[14px] font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-[#5850EC] text-white shadow-sm"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetProgress;
