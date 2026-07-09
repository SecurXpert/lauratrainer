import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import GetProgress from "@/components/GetProgress";
import { API_BASE_URL } from "./services/api/api";
import CurriculumHeader from "../components/Curriculum/CurriculumHeader";
import CurriculumFilter from "../components/Curriculum/CurriculumFilter";
import CurriculumTable from "../components/Curriculum/CurriculumTable";
import CurriculumPagination from "../components/Curriculum/CurriculumPagination";

const BASE_API = API_BASE_URL;

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
      <CurriculumHeader />

      <div className="p-2 md:p-3 space-y-6 flex-1">
        <Card className="rounded-[24px] border border-slate-100 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <CurriculumFilter 
              students={students}
              courses={courses}
              selectedStudentId={selectedStudentId}
              setSelectedStudentId={setSelectedStudentId}
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              handleGetCurriculum={handleGetCurriculum}
              loading={loading}
            />

            <div className="rounded-[18px] border border-gray-100 overflow-hidden bg-white mt-6">
              <CurriculumTable 
                curriculumList={curriculumList}
                currentItems={currentItems}
                selectedStudentId={selectedStudentId}
                completedModules={completedModules}
                navigate={navigate}
                handleDelete={handleDelete}
                updateModuleStatus={updateModuleStatus}
              />
              <CurriculumPagination 
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                curriculumLength={curriculumList.length}
              />
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