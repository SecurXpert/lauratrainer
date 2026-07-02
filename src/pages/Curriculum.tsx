import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import GetProgress from "@/components/GetProgress";

const BASE_API = "https://lauratek.in:8000";

const Curriculum = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [curriculumList, setCurriculumList] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({});
  const [triggerRefresh, setTriggerRefresh] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, selectedStudentId, curriculumList]);

  const [completedModules, setCompletedModules] = useState<Record<number, string>>(() => {
    const cached = localStorage.getItem("completed_modules");
    return cached ? JSON.parse(cached) : {};
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = curriculumList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(curriculumList.length / itemsPerPage);

  const fetchStudentProgress = async (studentId: string, courseId: string) => {
    if (!studentId || !courseId || courseId === "all") return;
    try {
      const res = await fetch(`${BASE_API}/courses/trainer/students/${studentId}/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.modules)) {
          setCompletedModules((prev) => {
            const updated = { ...prev };
            data.modules.forEach((mod: any) => {
              updated[mod.module_id] = mod.status || "pending";
            });
            localStorage.setItem("completed_modules", JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch student progress", err);
    }
  };

  useEffect(() => {
    setCompletedModules({});
    if (selectedStudentId && selectedCourseId && selectedCourseId !== "all") {
      fetchStudentProgress(selectedStudentId, selectedCourseId);
    }
  }, [selectedStudentId, selectedCourseId]);

  const updateModuleStatus = async (courseId: number, moduleId: number, status: string) => {
    if (!selectedStudentId) {
      toast.error("Please select a student first");
      return;
    }

    try {
      const url = `${BASE_API}/courses/students/${selectedStudentId}/courses/${courseId}/modules/${moduleId}/status?status_value=${status}`;
      console.log("Calling Update Status API:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("Update Status API Status:", res.status);
      const resText = await res.text();
      console.log("Update Status API Response:", resText);

      if (!res.ok) {
        let errorMessage = "Failed to update module status";
        try {
          const errorData = JSON.parse(resText);
          errorMessage = errorData.detail || errorMessage;
        } catch (_) { }
        throw new Error(errorMessage);
      }

      setCompletedModules((prev) => {
        const updated = { ...prev, [moduleId]: status };
        localStorage.setItem("completed_modules", JSON.stringify(updated));
        return updated;
      });

      toast.success(`Module status updated to ${status}`);
      setTriggerRefresh((prev) => prev + 1);

      if (selectedCourseId !== "all") {
        fetchStudentProgress(selectedStudentId, selectedCourseId);
      }
    } catch (err: any) {
      console.error("Update Status Error:", err);
      toast.error(err.message || "Failed to update module status");
    }
  };

  const toggleDesc = (id: number) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_API}/trainer/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load courses");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${BASE_API}/trainer/my-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load students");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && selectedCourseId === "all" && curriculumList.length === 0) {
      handleGetCurriculum();
    }
  }, [courses]);

  // Fetch Curriculum
  const handleGetCurriculum = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    try {
      setLoading(true);
      if (selectedCourseId === "all") {
        const allCurriculum: any[] = [];
        const promises = courses.map(async (course) => {
          try {
            const res = await fetch(`${BASE_API}/courses/trainer/${course.id}/curriculum`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                // Add course title to each curriculum item so it's clear in the UI
                const mappedData = data.map(item => ({ ...item, course_title: course.title }));
                allCurriculum.push(...mappedData);
              }
            }
          } catch (e) {
            console.error(`Failed to fetch curriculum for course ${course.id}:`, e);
          }
        });
        await Promise.all(promises);
        setCurriculumList(allCurriculum.sort((a, b) => b.id - a.id));
      } else {
        const res = await fetch(`${BASE_API}/courses/trainer/${selectedCourseId}/curriculum`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setCurriculumList(Array.isArray(data) ? data.sort((a: any, b: any) => b.id - a.id) : []);
      }
    } catch {
      toast.error("Failed to fetch curriculum");
      setCurriculumList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: number, moduleId: number) => {
    // Optimistically update the UI to instantly remove the row
    const previousList = [...curriculumList];
    setCurriculumList(curriculumList.filter((item) => item.id !== moduleId));

    try {
      const res = await fetch(`${BASE_API}/courses/${courseId}/curriculum/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Module deleted successfully", { duration: 3000 });

      // Keep state in sync without disrupting
      handleGetCurriculum();
    } catch {
      // Revert UI if the API call fails
      setCurriculumList(previousList);
      toast.error("Failed to delete module", { duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F8FAFC] px-2 md:px-3 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-transparent">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Curriculum Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-0">Manage and monitor your Curriculum</p>
        </div>
        <Button
          onClick={() => navigate("/curriculum/new")}
          className="w-full sm:w-auto text-sm font-intern bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-xl px-6 h-11 shadow-[0_8px_16px_-2px_rgba(124,58,237,0.5)] hover:shadow-[0_10px_20px_-2px_rgba(124,58,237,0.6)] transition-all duration-300 flex justify-center items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Curriculum
        </Button>
      </div>

      <div className="p-2 md:p-3 space-y-6 flex-1">
      {/* Combined Single Card: Fetch + Curriculum List */}
      <Card className="rounded-[24px] border border-slate-100 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Top Fetch Section */}
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

          {/* Inner Table Card */}
          <div className="rounded-[18px] border border-gray-100 overflow-hidden bg-white mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-5 sm:py-7">
              <CardTitle className="text-[20px] sm:text-[24px] font-bold text-gray-900">
                Curriculum List
              </CardTitle>

              <div className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[13px] sm:text-sm font-semibold w-fit">
                Total: {curriculumList.length} Modules
              </div>
            </div>

            {curriculumList.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Select a course and click "Fetch Data" to load curriculum
              </div>
            ) : (
              <>
                <div className="overflow-x-auto [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-100 text-gray-500">
                        <th className="px-4 sm:px-7 py-4 sm:py-5 text-left font-semibold whitespace-nowrap">MODULE ID</th>
                        <th className="px-4 sm:px-7 py-4 sm:py-5 text-left font-semibold whitespace-nowrap">COURSE ID</th>
                        <th className="px-4 sm:px-7 py-4 sm:py-5 text-left font-semibold whitespace-nowrap">MODULE TITLE</th>
                        <th className="px-4 sm:px-7 py-4 sm:py-5 text-center font-semibold whitespace-nowrap">STATUS</th>
                        <th className="px-4 sm:px-7 py-4 sm:py-5 text-center font-semibold whitespace-nowrap">ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                        >
                          <td className="px-4 sm:px-7 py-4 sm:py-6 text-gray-500 font-medium">
                            {item.id}
                          </td>

                          <td className="px-4 sm:px-7 py-4 sm:py-6 text-gray-500 font-medium">
                            {item.course_id}
                          </td>

                          <td className="px-4 sm:px-7 py-4 sm:py-6">
                            <div className="text-[18px] font-bold text-gray-900 leading-tight">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="mt-1.5">
                                <div className="text-[14px] text-gray-500 leading-snug max-h-[38px] overflow-hidden">
                                  {item.description}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-4 sm:px-7 py-4 sm:py-6 text-center text-gray-500 font-medium">
                            {item.is_active ? "Active" : "Inactive"}
                          </td>

                          <td className="px-4 sm:px-7 py-4 sm:py-6">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex justify-center items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                                  onClick={() => navigate(`/curriculum/${item.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 transition-all rounded-lg"
                                  onClick={() => handleDelete(item.course_id, item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {selectedStudentId ? (
                                <Select
                                  value={completedModules[item.id] || "pending"}
                                  onValueChange={(val) => updateModuleStatus(item.course_id, item.id, val)}
                                >
                                  <SelectTrigger className={`h-8 w-[130px] rounded-full text-[11.5px] font-bold border transition-all duration-200 cursor-pointer ${
                                    completedModules[item.id] === "completed"
                                      ? "bg-[#d1fae5] border-[#6ee7b7] text-[#065f46] hover:bg-[#a7f3d0]"
                                      : completedModules[item.id] === "in_progress"
                                      ? "bg-[#dbeafe] border-[#93c5fd] text-[#1e40af] hover:bg-[#bfdbfe]"
                                      : "bg-[#f3f4f6] border-[#d1d5db] text-[#374151] hover:bg-[#e5e7eb]"
                                  }`}>
                                    <SelectValue placeholder="Set Status" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    <SelectItem value="pending" className="text-gray-700 text-xs font-semibold">Pending</SelectItem>
                                    <SelectItem value="in_progress" className="text-blue-700 text-xs font-semibold">In Progress</SelectItem>
                                    <SelectItem value="completed" className="text-emerald-700 text-xs font-semibold">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-medium italic">
                                  Select student to set status
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination — outside overflow-x-auto so no horizontal scrollbar appears below it */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <GetProgress
        courses={courses}
        students={students}
        initialStudentId={selectedStudentId}
        initialCourseId={selectedCourseId}
        triggerRefresh={triggerRefresh}
      />
      </div>
    </div>
  );
};

export default Curriculum;