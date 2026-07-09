import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { API_BASE_URL } from "./services/api/api";

import { Category, CourseCounts } from "../components/Courses/CoursesTypes";
import CoursesHeader from "../components/Courses/CoursesHeader";
import CoursesMetrics from "../components/Courses/CoursesMetrics";
import CoursesFilter from "../components/Courses/CoursesFilter";
import CoursesGrid from "../components/Courses/CoursesGrid";
import CoursesPagination from "../components/Courses/CoursesPagination";

const API_BASE = `${API_BASE_URL}/trainer/courses`;

const Courses = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // Date limit: Present day minus/plus 7 days
  const getFormattedDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minDate = getFormattedDate(-7);
  const maxDate = getFormattedDate(7);

  // Capitalize first letter of each word (Title Case)
  const capitalizeWords = (str: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedLevel, setAppliedLevel] = useState("all");
  const [appliedLanguage, setAppliedLanguage] = useState("all");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");
  const [appliedDate, setAppliedDate] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [instructorName, setInstructorName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<CourseCounts>({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
  });

  const fetchCounts = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trainer/courses/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/trainer/my-students/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!coursesRes.ok || !studentsRes.ok) throw new Error();

      const coursesData = await coursesRes.json();
      const studentsData = await studentsRes.json();

      setCounts({
        totalCourses: coursesData.course_count || 0,
        activeCourses: coursesData.course_count || 0,
        totalEnrollments: studentsData.count || 0,
      });
    } catch {
      toast.error("Failed to fetch counts");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get<Category[]>("/admin/categories");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryName = (id: any) => {
    if (!id) return "N/A";
    const cat = categories.find(c => String(c.id) === String(id));
    return cat ? cat.name : String(id);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const uniqueLanguages = [...new Set(
    courses.map((course) => course.language).filter((lang) => lang && lang.trim() !== "")
  )];

  const filteredCourses = courses.filter((course) => {
    const searchLower = appliedSearchTerm.toLowerCase().trim();

    const matchesSearch =
      !searchLower ||
      course.title?.toLowerCase().includes(searchLower) ||
      course.id?.toString().includes(searchLower);

    const matchesLevel =
      appliedLevel === "all" ||
      course.level?.toLowerCase() === appliedLevel.toLowerCase();

    const matchesLanguage =
      appliedLanguage === "all" ||
      course.language?.toLowerCase() === appliedLanguage.toLowerCase();

    const matchesStatus =
      appliedStatus === "all" ||
      course.status?.toLowerCase() === appliedStatus.toLowerCase();

    const courseCategoryId =
      course.category_id ?? course.categoryId ?? course.category?.id ?? null;
    const matchesCategory =
      appliedCategory === "all" ||
      (courseCategoryId != null && String(courseCategoryId) === String(appliedCategory));

    const courseDate =
      course.startDate ??
      course.start_date ??
      course.date ??
      course.schedule_date ??
      "";
    const matchesDate =
      !appliedDate ||
      String(courseDate).includes(appliedDate);

    return (
      matchesSearch &&
      matchesLevel &&
      matchesLanguage &&
      matchesStatus &&
      matchesCategory &&
      matchesDate
    );
  });

  const handleApplyFilters = () => {
    const searchLower = searchTerm.toLowerCase().trim();

    const matches = courses.filter((course: any) => {
      const matchesSearch =
        !searchLower ||
        course.title?.toLowerCase().includes(searchLower) ||
        course.id?.toString().includes(searchLower);

      const matchesLevel =
        selectedLevel === "all" ||
        course.level?.toLowerCase() === selectedLevel.toLowerCase();

      const matchesLanguage =
        selectedLanguage === "all" ||
        course.language?.toLowerCase() === selectedLanguage.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" ||
        course.status?.toLowerCase() === selectedStatus.toLowerCase();

      const courseCategoryId =
        course.category_id ?? course.categoryId ?? course.category?.id ?? null;
      const matchesCategory =
        selectedCategory === "all" ||
        (courseCategoryId != null && String(courseCategoryId) === String(selectedCategory));

      const courseDate =
        course.startDate ??
        course.start_date ??
        course.date ??
        course.schedule_date ??
        "";
      const matchesDate =
        !selectedDate ||
        String(courseDate).includes(selectedDate);

      return (
        matchesSearch &&
        matchesLevel &&
        matchesLanguage &&
        matchesStatus &&
        matchesCategory &&
        matchesDate
      );
    });

    if (matches.length === 0) {
      toast.error("Course not found!");
    }

    setAppliedSearchTerm(searchTerm);
    setAppliedLevel(selectedLevel);
    setAppliedLanguage(selectedLanguage);
    setAppliedStatus(selectedStatus);
    setAppliedCategory(selectedCategory);
    setAppliedDate(selectedDate);
    setCurrentPage(1);
  };

  const handleDelete = async (id: any) => {
    const targetCourse = courses.find((c: any) => c.id === id);
    const courseTitle = targetCourse?.title || "Automation testing";

    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses((prev) => prev.filter((c: any) => c.id !== id));

      // Render custom high-fidelity success popup
      toast.custom(() => (
        <div className="bg-white border-[1.5px] border-[#22C55E] rounded-[16px] px-5 py-4 flex items-center gap-4 w-[440px] max-w-[90vw] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="w-[30px] h-[30px] rounded-full border-2 border-[#22C55E] flex items-center justify-center shrink-0 bg-white">
            <svg className="w-3.5 h-3.5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[15.5px] font-bold text-[#0F172A] mb-1 leading-none">Deleted successfully</h4>
            <div className="space-y-0.5 text-[13px] text-slate-500 font-medium">
              <p>Course name: <span className="text-[#1E293B] font-bold">{courseTitle}</span></p>
              <p>Course ID: <span className="text-[#1E293B] font-bold">{id}</span></p>
            </div>
          </div>
        </div>
      ), { duration: 3000, position: "top-center" });

    } catch {
      toast.error("Failed to delete course");
    }
  };

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CoursesHeader onAddCourse={() => navigate("/courses/new")} />

      <div className="w-full space-y-6 p-2 md:p-3 flex-1">
        <CoursesMetrics 
          coursesLength={courses.length}
          activeCoursesLength={courses.filter(c => c.status?.toLowerCase() === 'active').length}
          counts={counts}
        />

        <CoursesFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredCoursesLength={filteredCourses.length}
          coursesLength={courses.length}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          uniqueLanguages={uniqueLanguages}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          handleApplyFilters={handleApplyFilters}
        />

        <CoursesGrid 
          currentCourses={currentCourses}
          instructorName={instructorName}
          getCategoryName={getCategoryName}
          capitalizeWords={capitalizeWords}
          onEditCourse={(id) => navigate(`/courses/${id}/edit`)}
          onDeleteCourse={handleDelete}
        />

        <CoursesPagination 
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        {!loading && filteredCourses.length === 0 && (
          <p className="text-center py-12 text-gray-500">No courses found</p>
        )}
      </div>
    </div>
  );
};

export default Courses;