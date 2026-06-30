import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  FaAward,
  FaChartLine,
  FaUsers,
  FaPlus,
  FaCheckCircle,
  FaMedal,
} from "react-icons/fa";
import { FiAward } from "react-icons/fi";
import { Search, ChevronDown } from "lucide-react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";


const API_BASE = "https://lauratek.in:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

interface Course {
  id: number;
  name?: string;
  title?: string;
}

interface Badge {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  icon_url?: string;
  rule?: any;
  additionalProp1?: any;
  is_active: boolean;
  created_at?: string;
}

interface Student {
  id: number;
  name?: string;
  email?: string;
  username?: string;
}

const Badges: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [totalBadgesCount, setTotalBadgesCount] = useState<number>(0);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedBadgeIdForEval, setSelectedBadgeIdForEval] =
    useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_url: "",
    rule: "{}",
    additionalProp1: "{}",
    is_active: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDate, filterStatus, selectedCourseId]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get<Course[]>("/trainer/courses");
        const loadedCourses = res.data || [];
        setCourses(loadedCourses);
      } catch (err: any) {
        console.error("Courses fetch failed:", err);
        setError("Failed to load courses");
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/trainer/my-students");

        if (Array.isArray(res.data)) {
          setStudents(res.data);
        } else {
          console.warn("Students endpoint did not return an array:", res.data);
          setStudents([]);
          toast.warning("Student list format is invalid");
        }
      } catch (err: any) {
        console.error("Students fetch failed:", err);
        setStudents([]);
        toast.error("Failed to load students");
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchAllBadgesCount = async () => {
      if (courses.length === 0) return;
      try {
        const promises = courses.map((course) =>
          api.get<Badge[]>(`/courses/${course.id}/badges`).catch(() => ({ data: [] }))
        );
        const results = await Promise.all(promises);
        const allBadges = results.flatMap((res) => res.data || []);
        setTotalBadgesCount(allBadges.length);
      } catch (err) {
        console.error("Failed to fetch all badges count:", err);
      }
    };
    fetchAllBadgesCount();
  }, [courses]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        if (!selectedCourseId) {
          if (courses.length === 0) {
            setBadges([]);
            return;
          }
          const promises = courses.map((course) =>
            api.get<Badge[]>(`/courses/${course.id}/badges`).catch(() => ({ data: [] }))
          );
          const results = await Promise.all(promises);
          const allBadges = results.flatMap((res) => res.data || []);
          setBadges(allBadges);
        } else {
          const res = await api.get<Badge[]>(`/courses/${selectedCourseId}/badges`);
          setBadges(res.data || []);
        }
      } catch (err: any) {
        console.error("Badges fetch failed:", err);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [selectedCourseId, courses]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const parseJsonSafely = (str: string, fieldName: string): any => {
    const trimmed = str.trim();

    if (!trimmed || trimmed === "{}") return {};

    try {
      return JSON.parse(trimmed);
    } catch (err: any) {
      toast.error(`Invalid JSON in "${fieldName}" field: ${err.message}`);
      throw err;
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error("Please select a course first");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Badge name is required");
      return;
    }

    let ruleObj: any;
    let additionalObj: any;

    try {
      ruleObj = parseJsonSafely(formData.rule, "Rule");
      additionalObj = parseJsonSafely(
        formData.additionalProp1,
        "Additional Properties",
      );
    } catch {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      icon_url: formData.icon_url.trim() || undefined,
      rule: ruleObj,
      additionalProp1: additionalObj,
      is_active: formData.is_active,
    };

    try {
      setLoading(true);
      await api.post(`/courses/${selectedCourseId}/badges`, payload);

      toast.success("Badge created successfully!");
      setIsCreateModalOpen(false);

      setFormData({
        name: "",
        description: "",
        icon_url: "",
        rule: "{}",
        additionalProp1: "{}",
        is_active: true,
      });

      const res = await api.get<Badge[]>(`/courses/${selectedCourseId}/badges`);
      setBadges(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create badge");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error("No course selected");
      return;
    }

    if (!selectedBadgeIdForEval) {
      toast.error("Please select a badge");
      return;
    }

    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }

    try {
      setLoading(true);
      const url = `/courses/${selectedCourseId}/badges/${selectedBadgeIdForEval}/evaluate/${selectedStudentId}`;
      await api.post(url);

      toast.success("Badge successfully evaluated for the student!");
      setIsEvaluateModalOpen(false);
      setSelectedStudentId("");
      setSelectedBadgeIdForEval("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to evaluate badge");
    } finally {
      setLoading(false);
    }
  };

  const activeBadgesCount = React.useMemo(() => {
    return badges.filter((b) => b.is_active).length;
  }, [badges]);

  const thisMonthBadgesCount = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return badges.filter((badge) => {
      if (badge.created_at) {
        const d = new Date(badge.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      return false;
    }).length;
  }, [badges]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full">
        <div className="sticky top-0 z-50 bg-gray-50/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-5 sm:mb-7 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold">Badges & Achievements</h1>
            <p className="text-[#64748B]">
              Manage student badges and rewards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={loading}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              <FaPlus className="text-sm" />
              Create Badge
            </button>

            <button
              type="button"
              onClick={() => setIsEvaluateModalOpen(true)}
              disabled={loading || !selectedCourseId || badges.length === 0}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${!selectedCourseId || badges.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              <FaCheckCircle className="text-sm" />
              Evaluate Student
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Badges */}
          <div className="bg-white shadow-md border border-gray-200 rounded-[20px] px-5 py-6  flex items-start justify-between min-h-[118px]">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] mb-3">
                Total Badges
              </p>
              <p className="text-[29px] leading-none font-bold tracking-[-1px] text-[#111827]">
                {totalBadgesCount}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center text-blue-600 shrink-0">
              <FiAward className="w-5 h-5" />
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-white shadow-md border border-gray-200 rounded-[20px] px-5 py-6  flex items-start justify-between min-h-[118px]">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] mb-3">
                Active Students
              </p>
              <p className="text-[29px] leading-none font-bold tracking-[-1px] text-[#9333EA]">
                {students.length}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center text-purple-600 shrink-0">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>

          {/* This Month */}
          {/* <div className="bg-white border border-gray-200 rounded-3xl px-5 py-6 shadow-sm flex items-start justify-between min-h-[118px]">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] mb-3">
                This Month
              </p>
              <p className="text-[29px] leading-none font-bold tracking-[-1px] text-[#EA580C]">
                +145
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center text-orange-600 shrink-0">
              <FaArrowTrendUp className="w-5 h-5" />
            </div>
          </div> */}
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}




        {/* Filters & Search */}
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
            {/* Search - Flexible width */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Right Side Group */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
                  style={{ colorScheme: "light" }}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors bg-[#F9FAFB] pl-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </button>
              </div>

              <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterDate("");
                  setFilterStatus("All Status");
                  setSelectedCourseId("");
                }}
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Bottom side - Course Dropdown */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-[14px] font-semibold text-slate-700 mb-2">
              Select Course
            </label>
            <div className="relative w-full sm:w-[350px]">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-colors text-[15px] font-medium text-slate-700 appearance-none cursor-pointer"
                disabled={loading || courses.length === 0}
              >
                <option value="">All Courses</option>
                {courses.map((course) => {
                  const title = course.name || course.title || `Course #${course.id}`;
                  const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                  return (
                    <option key={course.id} value={course.id}>
                      {displayTitle} (ID: {course.id})
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
  {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              Loading badges...
            </p>
          </div>
        )}

        {!loading && badges.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No badges found.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {(() => {
            const filteredBadges = badges.filter((badge) => {
              if (searchQuery && !badge.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
              }
              if (filterStatus === "Active" && !badge.is_active) return false;
              if (filterStatus === "Inactive" && badge.is_active) return false;
              if (filterDate && badge.created_at && !badge.created_at.startsWith(filterDate)) {
                return false;
              }
              return true;
            });

            const totalPages = Math.ceil(filteredBadges.length / itemsPerPage) || 1;
            const paginatedBadges = filteredBadges.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            );

            return (
              <>
                {paginatedBadges.map((badge, index) => {
                  const badgeGradients = [
                    "from-amber-400 to-orange-500 shadow-[0_4px_14px_rgba(245,158,11,0.25)]", // Orange
                    "from-emerald-400 to-teal-500 shadow-[0_4px_14px_rgba(16,185,129,0.25)]", // Green
                    "from-cyan-400 to-blue-500 shadow-[0_4px_14px_rgba(6,182,212,0.25)]", // Blue
                    "from-fuchsia-400 to-purple-500 shadow-[0_4px_14px_rgba(217,70,239,0.25)]", // Pink
                    "from-rose-400 to-red-500 shadow-[0_4px_14px_rgba(244,63,94,0.25)]", // Red
                    "from-indigo-400 to-violet-500 shadow-[0_4px_14px_rgba(99,102,241,0.25)]", // Indigo/Purple
                  ];
                  const bgGradient = badgeGradients[index % badgeGradients.length];

                  return (
                    <div
                      key={badge.id}
                      className="bg-white border border-slate-100 rounded-[20px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center text-center group"
                    >
                      {/* Vibrant Icon Container */}
                      <div className={`w-20 h-20 rounded-[18px] bg-gradient-to-b ${bgGradient} flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                        {badge.icon_url ? (
                          <img
                            src={badge.icon_url}
                            alt={badge.name}
                            className="w-10 h-10 object-contain drop-shadow-md"
                          />
                        ) : (
                          <FaMedal className="text-4xl drop-shadow-md opacity-90" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-[17px] font-bold text-[#111827] mb-1.5 line-clamp-1">
                        {badge.name}
                      </h3>

                      {/* Description */}
                      <p className="text-[13.5px] text-[#6B7280] font-medium mb-6 h-[40px] overflow-hidden leading-[20px] break-all">
                        {badge.description || "No description"}
                      </p>

                      {/* Status Pill */}
                      <div className={`mt-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${badge.is_active ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${badge.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                        <span className={`text-[12px] font-bold tracking-wide uppercase ${badge.is_active ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {badge.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </>
            );
          })()}
        </div>

        {(() => {
          const filteredCount = badges.filter((badge) => {
            if (searchQuery && !badge.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filterStatus === "Active" && !badge.is_active) return false;
            if (filterStatus === "Inactive" && badge.is_active) return false;
            if (filterDate && badge.created_at && !badge.created_at.startsWith(filterDate)) return false;
            return true;
          }).length;
          const totalPages = Math.ceil(filteredCount / itemsPerPage) || 1;

          if (totalPages <= 1) return null;

          return (
            <div className="flex items-center justify-center gap-2 mt-8 mb-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          );
        })()}

        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden border border-white/20">
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <FaAward className="w-5 h-5" />
                  </div>
                  <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight">Create New Badge</h2>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="flex flex-col overflow-hidden bg-white">
                <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                        Select Course <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm cursor-pointer"
                        required
                        disabled={loading || courses.length === 0}
                      >
                        <option value="">-- Select a course --</option>
                        {courses.map((course) => {
                          const title = course.name || course.title || `Course #${course.id}`;
                          const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                          return (
                            <option key={course.id} value={course.id}>
                              {displayTitle} (ID: {course.id})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                        Badge Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={(e) => {
                          if (e.target.value.length <= 25) handleInputChange(e);
                        }}
                        maxLength={25}
                        required
                        placeholder="e.g. Frontend Master"
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 150) handleInputChange(e);
                        }}
                        maxLength={150}
                        rows={3}
                        placeholder="Describe the requirements..."
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none resize-none shadow-sm placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                        Icon URL
                      </label>
                      <input
                        name="icon_url"
                        value={formData.icon_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/icon.png"
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                          Rule (JSON)
                        </label>
                        <textarea
                          name="rule"
                          value={formData.rule}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[13px] font-mono text-slate-600 outline-none resize-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                          Additional Props
                        </label>
                        <textarea
                          name="additionalProp1"
                          value={formData.additionalProp1}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[13px] font-mono text-slate-600 outline-none resize-none shadow-sm"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-4 p-4 sm:p-5 border border-slate-200 rounded-2xl bg-white cursor-pointer hover:bg-slate-50/50 hover:border-indigo-200 transition-all shadow-sm group">
                      <div className="relative flex items-center justify-center shrink-0">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          name="is_active"
                          className="peer sr-only"
                        />
                        <div className="w-6 h-6 rounded-lg border-2 border-slate-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center bg-white shadow-sm group-hover:border-indigo-400 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/20">
                          <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-slate-800 leading-none mb-1.5">Active Status</span>
                        <span className="text-[13.5px] text-slate-500 font-medium leading-snug">Badge will be visible immediately.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-full sm:w-auto h-12 px-6 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-slate-800 font-bold text-[15px] transition-all shadow-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto h-12 px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-[15px] shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2.5 border-0"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span>
                    ) : (
                      <>
                        <FaPlus className="w-3.5 h-3.5" />
                        Create Badge
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEvaluateModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden border border-white/20">
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <FaCheckCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight">Evaluate Badge</h2>
                </div>
                <button
                  onClick={() => setIsEvaluateModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleEvaluateSubmit} className="flex flex-col overflow-hidden bg-white">
                <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                        Select Student <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        required
                        disabled={
                          loading ||
                          !Array.isArray(students) ||
                          students.length === 0
                        }
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">-- Select a student --</option>
                        {Array.isArray(students) &&
                          students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name || student.username || student.email || `Student #${student.id}`}
                            </option>
                          ))}
                      </select>
                      {(!Array.isArray(students) || students.length === 0) && (
                        <p className="text-[13px] text-rose-500 font-medium mt-2">
                          No students found.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                        Select Badge <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedBadgeIdForEval}
                        onChange={(e) => setSelectedBadgeIdForEval(e.target.value)}
                        required
                        disabled={loading || badges.length === 0}
                        className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">-- Select a badge --</option>
                        {badges.map((badge) => (
                          <option key={badge.id} value={badge.id}>
                            {badge.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEvaluateModalOpen(false)}
                    className="w-full sm:w-auto h-12 px-6 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-slate-800 font-bold text-[15px] transition-all shadow-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto h-12 px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-[15px] shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2.5 border-0"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating...</span>
                    ) : (
                      <>
                        <FaCheckCircle className="w-3.5 h-3.5" />
                        Evaluate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges;
