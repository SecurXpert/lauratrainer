import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Calendar, BookOpen, Clock, Globe, Users, FileText } from "lucide-react";
import { FaChartColumn } from "react-icons/fa6";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";

const API_BASE = "https://lauratek.in:8000/trainer/courses";

type Category = {
  id: number;
  name: string;
};

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
  const [counts, setCounts] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
  });

  const fetchCounts = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        fetch("https://lauratek.in:8000/trainer/courses/count", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://lauratek.in:8000/trainer/my-students/count", {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-50 px-2 md:px-3 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-transparent">
        <div>
          <h1 className="text-[24px] sm:text-[30px] font-bold">Courses Management</h1>
          <p className="text-[14px] sm:text-[16px] text-[#64748B]">Manage and monitor your courses</p>
        </div>
        <Button
          onClick={() => navigate("/courses/new")}
          className="w-full sm:w-auto bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white border-0 shadow-[0_4px_14px_rgba(99,102,241,0.3)] transition-all duration-300 rounded-xl px-5 h-11 font-medium flex justify-center items-center"
        >
          <Plus className="w-5 h-5 mr-2 stroke-[2.5]" />
          Add Course
        </Button>
      </div>

      <div className="w-full space-y-6 p-2 md:p-3 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-8">
          {/* Card 1: Total Courses */}
          <Card className="bg-white border border-slate-100/90 rounded-[20px] sm:rounded-[24px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.02),_0_4px_12px_-2px_rgba(0,0,0,0.01)] relative overflow-hidden bg-[radial-gradient(circle_at_60%_50%,_rgba(124,58,237,0.12),_transparent_65%)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.03)]">
            <CardContent className="p-4 sm:p-5 lg:p-7">
              <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[18px] bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_8px_20px_-2px_rgba(79,70,229,0.35)]">
                <BookOpen className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
              </div>
              <p className="text-[12.5px] sm:text-[14.5px] text-[#64748B] font-medium tracking-tight mb-1">Total Courses</p>
              <p className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">
                {courses.length}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Active Courses */}
          <Card className="bg-white border border-slate-100/90 rounded-[20px] sm:rounded-[24px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.02),_0_4px_12px_-2px_rgba(0,0,0,0.01)] relative overflow-hidden bg-[radial-gradient(circle_at_60%_50%,_rgba(124,58,237,0.12),_transparent_65%)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.03)]">
            <CardContent className="p-4 sm:p-5 lg:p-7">
              <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[18px] bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_8px_20px_-2px_rgba(79,70,229,0.35)]">
                <BookOpen className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
              </div>
              <p className="text-[12.5px] sm:text-[14.5px] text-[#64748B] font-medium tracking-tight mb-1">Active Courses</p>
              <p className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">
                {courses.filter(c => c.status?.toLowerCase() === 'active').length}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Total Enrollments */}
          <Card className="col-span-2 sm:col-span-1 bg-white border border-slate-100/90 rounded-[20px] sm:rounded-[24px] shadow-[0_12px_30px_-4px_rgba(0,0,0,0.02),_0_4px_12px_-2px_rgba(0,0,0,0.01)] relative overflow-hidden bg-[radial-gradient(circle_at_60%_50%,_rgba(124,58,237,0.12),_transparent_65%)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.03)]">
            <CardContent className="p-4 sm:p-5 lg:p-7">
              <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[14px] sm:rounded-[18px] bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_8px_20px_-2px_rgba(79,70,229,0.35)]">
                <FileText className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
              </div>
              <p className="text-[12.5px] sm:text-[14.5px] text-[#64748B] font-medium tracking-tight mb-1">Total Enrollments</p>
              <p className="text-[28px] sm:text-[36px] font-bold text-[#0F172A] leading-none tracking-tight">
                {counts.totalEnrollments}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-[22px] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.06)] border-[1.35px] border-[#E5E7EB] p-4 sm:p-6 lg:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-12 gap-4">
            <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-6 z-20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 z-10" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                maxLength={25}
                onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text relative"
              />
              {searchTerm && courses.filter(course => 
                course.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()) || 
                course.id?.toString().includes(searchTerm.toLowerCase().trim())
              ).length === 0 && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border-[1.35px] border-[#E5E7EB] rounded-[14px] shadow-md py-4 z-50 text-center animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="text-[14px] text-[#64748B] font-medium tracking-wide">No results found</span>
                </div>
              )}
            </div>

            <div className="xl:col-span-3 lg:col-span-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] font-medium text-gray-700 cursor-pointer px-2 sm:px-2.5">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-3 lg:col-span-1">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full h-11 bg-[#F8FAFC] font-medium border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 cursor-pointer">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="midlevel">Midlevel</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-3 lg:col-span-1">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full h-11 bg-[#F8FAFC] font-medium border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] tracking-tight text-gray-800 cursor-pointer px-2 sm:px-2">
                  <SelectValue placeholder="All Programming Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programming Language</SelectItem>
                  {uniqueLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-3 lg:col-span-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-11 bg-[#F8FAFC] font-medium border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 cursor-pointer">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-3 lg:col-span-1 relative w-full">
              <Input
                type="date"
                // min={minDate}
                // max={maxDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] font-medium pr-10 text-[13px] text-gray-700 cursor-pointer"
              />
              <button
                type="button"
                onClick={(e) => {
                  const wrapper = e.currentTarget.parentElement as HTMLElement | null;
                  const input = wrapper?.querySelector('input') as HTMLInputElement | null;
                  if (!input) return;
                  const anyInput = input as HTMLInputElement & { showPicker?: () => void };
                  if (typeof anyInput.showPicker === "function") anyInput.showPicker();
                  input.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                <Calendar className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="xl:col-span-3 lg:col-span-1">
              <Button onClick={handleApplyFilters} className="w-full h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-[13px] rounded-[14px] whitespace-nowrap shadow-[0_4px_14px_rgba(99,102,241,0.25)] transition-all cursor-pointer">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {(() => {
            const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
            const currentCourses = filteredCourses.slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE
            );

            return (
              <>
                {currentCourses.map((course: any) => (
                  <Card
                    key={course.id}
                    className="relative overflow-hidden border-[1.35px] border-[#E5E7EB] rounded-[22px] shadow-sm hover:shadow-md transition-all duration-200 bg-white bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.07),_transparent_45%)] flex flex-col h-full"
                  >
                    {/* Course Image Banner */}
                    <div className="h-44 w-full bg-slate-50 overflow-hidden relative shrink-0 border-b border-slate-100">
                      <img
                        src={
                          course.image
                            ? course.image.startsWith("http")
                              ? course.image
                              : `https://lauratek.in:8000${course.image.startsWith("/") ? "" : "/"}${course.image}`
                            : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                        }
                        alt={course.title || "Course Image"}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Status Badge Overlay */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`h-[24px] px-2.5 flex items-center justify-center text-[11.5px] font-bold rounded-full shadow-sm border backdrop-blur-md ${course.status?.toLowerCase() === "active"
                            ? "bg-[#F0FDF4]/90 text-[#16A34A] border-[#DCFCE7]/60"
                            : "bg-[#FEF2F2]/90 text-[#EF4444] border-[#FEE2E2]/60"
                            }`}
                        >
                          {capitalizeWords(course.status || "Active")}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start gap-3 sm:gap-4 mb-2.5">
                        <h3
                          className="text-[16px] sm:text-[18px] font-bold text-[#0F172A] leading-snug line-clamp-2"
                          title={course.title || "Untitled Course"}
                        >
                          {course.title || "Untitled Course"}
                        </h3>
                      </div>

                      <p className="text-slate-600 text-[13.5px] line-clamp-2 mb-3.5 leading-relaxed h-10">
                        {course.description || "No description available."}
                      </p>

                      <div className="py-1 my-1">
                        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-4 sm:gap-y-4.5 text-sm">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Calendar className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                              <p className="text-[12.5px] font-semibold leading-none">Schedule</p>
                            </div>
                            <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight truncate" title={course.schedule || "Jan 25-Jun 25"}>
                              {course.schedule || "Jan 25-Jun 25"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Users className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                              <p className="text-[12.5px] font-semibold leading-none">Instructor</p>
                            </div>
                            <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight truncate" title={course.instructor_name || course.instructor?.name || instructorName || String(course.instructor_id || "Laura")}>
                              {course.instructor_name || course.instructor?.name || instructorName || course.instructor_id || "Laura"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <FaChartColumn className="w-[15px] h-[15px] shrink-0 text-slate-600" />
                              <p className="text-[12.5px] font-semibold leading-none">Category</p>
                            </div>
                            <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight truncate">
                              {getCategoryName(course.category_id)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                              <p className="text-[12.5px] font-semibold leading-none">Level</p>
                            </div>
                            <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight capitalize truncate">
                              {capitalizeWords(course.level || "Intermediate")}
                            </p>
                          </div>

                          <div className="min-w-0 col-span-2">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Globe className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                              <p className="text-[12.5px] font-semibold leading-none">Language</p>
                            </div>
                            <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight capitalize truncate" title={capitalizeWords(course.language || "selenium java")}>
                              {capitalizeWords(course.language || "selenium java")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons restored to bottom */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
                        <Button
                          onClick={() => navigate(`/courses/${course.id}/edit`)}
                          className="w-full sm:flex-[1.3] h-9 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                        >
                          <Edit className="w-[15px] h-[15px]" />
                          Edit Course
                        </Button>
                        <Button
                          onClick={() => handleDelete(course.id)}
                          className="w-full sm:flex-1 h-9 bg-[#FF453A] hover:bg-[#E03E34] text-white rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 className="w-[15px] h-[15px]" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            );
          })()}
        </div>

        {/* Pagination Controls */}
        {Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 h-10 border-slate-200 text-slate-600 rounded-xl"
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPage(idx + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-xl font-semibold text-[14px] transition-all ${currentPage === idx + 1
                      ? 'bg-[#6366F1] text-white shadow-md border-0'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={currentPage === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)}
              onClick={() => {
                setCurrentPage((prev) => Math.min(Math.ceil(filteredCourses.length / ITEMS_PER_PAGE), prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 h-10 border-slate-200 text-slate-600 rounded-xl"
            >
              Next
            </Button>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <p className="text-center py-12 text-gray-500">No courses found</p>
        )}
      </div>
    </div>
  );
};

export default Courses;