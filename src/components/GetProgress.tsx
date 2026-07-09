import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/pages/services/api/api";
import ProgressHeader from "./Progress/ProgressHeader";
import ProgressTable from "./Progress/ProgressTable";
import ProgressPagination from "./Progress/ProgressPagination";
import { fetchSingleProgress, buildProgressRow } from "./Progress/ProgressHelpers";

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
  
  // These states are kept for backward compatibility and potential future use
  const [progressData, setProgressData] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [progressRows, setProgressRows] = useState<any[]>([]);

  // Table pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
            const data = await fetchSingleProgress(sId, cId, token);
            if (data) {
              const row = buildProgressRow(data, sId, cId, courses, students);
              if (row) rowsList.push(row);
            }
          })());
        }
      }

      await Promise.all(fetchPromises);

      if (selectedStudentId !== "all" && selectedCourseId !== "all") {
        const singleRes = await fetch(
          `${API_BASE_URL}/courses/trainer/students/${selectedStudentId}/courses/${selectedCourseId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (singleRes.ok) {
          const data = await singleRes.json();
          setProgressData(data);
        }

        const [statsRes, curriculumRes] = await Promise.all([
          fetch(`${API_BASE_URL}/quiz/admin/results/student/${selectedStudentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/courses/trainer/${selectedCourseId}/curriculum`, {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStudentId, selectedCourseId]);

  const rows = progressRows;
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = rows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border border-slate-100 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <ProgressHeader 
            students={students}
            courses={courses}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
          />

          {/* Student count */}
          <div className="text-[15px] font-semibold text-[#64748B] mb-5">
            {rows.length} Students
          </div>

          <ProgressTable paginatedRows={paginatedRows} />

          <ProgressPagination 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GetProgress;
