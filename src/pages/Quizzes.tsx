import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  Plus,
  BookOpen,
  Loader2,
  RotateCcw,
  Users,
  Clock,
  HelpCircle,
  Eye,
  Trash2,
  FileQuestion,
  TrendingUp,
  Star,
  Search,
  Filter,
  Upload,
  Pencil,
  Calendar,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  file?: string;
  status?: "active" | "inactive" | "draft";
  questions_count?: number;
  attempts?: number;
  time?: string;
  updated_at?: string;
  is_active?: boolean;
}

export default function Quizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Stats
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    avgScore: 0,
    activeQuizzes: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
    fetchStats();
  }, []);

  const fetchQuizzes = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setStatsLoading(true);
      }
      setError(null);
      const res = await axiosInstance.get("/trainer/quizzes");

      // Ensure data is always an array
      const data = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
      const sortedData = data.sort((a: Quiz, b: Quiz) => b.id - a.id);
      setQuizzes(sortedData);

      let totalAttemptsVal = data.reduce((acc: number, q: Quiz) => acc + (Number(q.attempts) || 0), 0);
      let avgScoreVal = 0;

      try {
        const statsRes = await axiosInstance.get("/quiz/admin/results/student/16");
        const statsData = statsRes.data;
        
        if (statsData) {
          if (statsData.message === "No results found") {
            avgScoreVal = 0;
          } else {
            if (statsData.total_attempts !== undefined) {
              totalAttemptsVal = Number(statsData.total_attempts);
            }
            if (data.length > 0) {
              if (statsData.accuracy_percentage !== undefined) {
                avgScoreVal = Math.round(Number(statsData.accuracy_percentage));
              } else if (statsData.average_score !== undefined) {
                avgScoreVal = Math.round(Number(statsData.average_score) * 100);
              }
            }
          }
        }
      } catch (statsErr) {
        console.error("Failed to load student stats:", statsErr);
        avgScoreVal = 0;
      }

      setStats({
        totalQuizzes: data.length,
        totalAttempts: totalAttemptsVal,
        avgScore: avgScoreVal,
        activeQuizzes: data.filter((q: Quiz) => getQuizStatus(q) === "active").length,
      });
    } catch (err: any) {
      console.error("Fetch Quizzes Error:", err);
      const msg = err.response?.data?.detail || err.message || "Could not load quizzes.";
      setError(msg);
      toast.error("Failed to load quizzes: " + msg);
    } finally {
      if (showLoading) {
        setLoading(false);
        setStatsLoading(false);
      }
    }
  };

  const fetchStats = async () => {
    // Stats are computed directly from the trainer quizzes list in fetchQuizzes to avoid race conditions and extra API requests.
  };

  const getQuizStatus = (quiz: Quiz): string => {
    if (quiz.status) return quiz.status.toLowerCase();
    if (quiz.is_active === true) return "active";
    if (quiz.is_active === false) return "inactive";
    return "active";
  };

  const handleDelete = async (quizId: number) => {
    const targetQuiz = quizzes.find((q) => q.id === quizId);
    const quizTitle = targetQuiz?.title || "Quiz";

    try {
      await axiosInstance.delete(`/trainer/quizzes/${quizId}`);

      // Optimistic UI update
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      if (targetQuiz) {
        setStats((prev) => ({
          ...prev,
          totalQuizzes: Math.max(0, prev.totalQuizzes - 1),
          activeQuizzes: getQuizStatus(targetQuiz) === "active" ? Math.max(0, prev.activeQuizzes - 1) : prev.activeQuizzes,
        }));
      }

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
              <p>Quiz name: <span className="text-[#1E293B] font-bold">{quizTitle}</span></p>
              <p>Quiz ID: <span className="text-[#1E293B] font-bold">{quizId}</span></p>
            </div>
          </div>
        </div>
      ), { duration: 3000, position: "top-center" });

      // Fetch silently in the background
      fetchQuizzes(false);
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete quiz");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      !searchTerm ||
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.id?.toString().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" ||
      getQuizStatus(quiz) === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full">
        {/* Header */}
        <div className="relative md:sticky md:top-0 z-30 bg-gray-50/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-4 sm:mb-5 border-b border-gray-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold">Quiz Management</h1>
            <p className="text-[#64748B]">
              Create and manage all your quizzes
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/quizzes/bulk-upload")}
              className="h-10 px-3 sm:px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Bulk Upload
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/quizzes/add-question")}
              className="h-10 px-3 sm:px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              Add Question
            </Button>

            <Button
              onClick={() => navigate("/quizzes/new")}
              className="h-10 px-4 sm:px-5 rounded-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs sm:text-sm font-medium shadow-[0_10px_22px_rgba(126,58,242,0.35)] flex items-center gap-1 sm:gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Quiz
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 mb-8">
          {/* Total Quizzes */}
          <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>

            <CardContent className="relative z-10 p-4 sm:p-6">
              <div className="flex flex-col">
                <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#e7efff] flex items-center justify-center mb-2 sm:mb-4">
                  <BookOpen
                    className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563eb]"
                    strokeWidth={2.2}
                  />
                </div>

                <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
                  {statsLoading ? "—" : stats.totalQuizzes}
                </h2>

                <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
                  Total Quizzes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Attempts */}
          <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#e9d5ff] rounded-full blur-[40px] opacity-100"></div>
            <CardContent className="relative z-10 p-4 sm:p-6">
              <div className="flex flex-col">
                <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#f3e8ff] flex items-center justify-center mb-2 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#7c3aed]" strokeWidth={2.2} />
                </div>

                <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
                  {statsLoading ? "—" : stats.totalAttempts.toLocaleString()}
                </h2>

                <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
                  Total Attempts
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Avg Score */}
          <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bbf7d0] rounded-full blur-[40px] opacity-100"></div>

            <CardContent className="relative z-10 p-4 sm:p-6">
              <div className="flex flex-col">
                <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#def7ec] flex items-center justify-center mb-2 sm:mb-4">
                  <TrendingUp
                    className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]"
                    strokeWidth={2.2}
                  />
                </div>

                <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
                  {statsLoading ? "—" : `${stats.avgScore}%`}
                </h2>

                <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
                  Avg Score
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Quizzes */}
          <Card className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden h-[140px] sm:h-[200px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#fed7aa] rounded-full blur-[40px] opacity-100"></div>

            <CardContent className="relative z-10 p-4 sm:p-6">
              <div className="flex flex-col">
                <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-[#fef3c7] flex items-center justify-center mb-2 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#f59e0b]" strokeWidth={2.2} />
                </div>

                <h2 className="text-[24px] sm:text-[30px] leading-[1] font-bold tracking-[-2px] text-[#0f172a]">
                  {statsLoading ? "—" : stats.activeQuizzes}
                </h2>

                <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-[#64748b]">
                  Active Quizzes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your quiz list</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
            {/* Search - Flexible width */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search quizzes by name..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setSearchTerm(val);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Right Side Group */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setCurrentPage(1);
                }}
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Grid - Updated to match reference alignment */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileQuestion className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium">No quizzes found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your filters or create a new quiz.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {(() => {
              const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
              const currentQuizzes = filteredQuizzes.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
              );

              return (
                <>
                  {currentQuizzes.map((quiz) => {
                    const quizStatus = getQuizStatus(quiz);
                    return (
                      <Card
                        key={quiz.id}
                        className="border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white relative"
                        style={{
                          background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.10) 0%, rgba(255, 255, 255, 1) 65%)"
                        }}
                      >
                        <CardContent className="p-6">
                          {/* Title + Active Badge */}
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 pr-2 min-h-[56px]">
                              {quiz.title}
                            </h3>
                            <Badge
                              className={`px-3 py-1 text-xs font-bold whitespace-nowrap ${quizStatus === "active"
                                ? "bg-[#F0FDF4] text-[#166534] hover:bg-[#F0FDF4]"
                                : "bg-gray-50 text-gray-400 hover:bg-gray-50"
                                }`}
                              style={quizStatus === "active" ? { border: "1.35px solid #B9F8CF" } : undefined}
                            >
                              {quizStatus.charAt(0).toUpperCase() +
                                quizStatus.slice(1)}
                            </Badge>
                          </div>

                          <hr className="border-gray-100 mb-3" />

                          {/* Stats Grid - 2x2 layout matching reference */}
                          <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-5 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                                <FileQuestion className="w-4 h-4 text-gray-400" /> Questions
                              </span>
                              <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                                {quiz.questions_count || 0}
                              </span>
                            </div>

                            {/* <div className="flex flex-col">
                              <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                                <Users className="w-4 h-4 text-gray-400" /> Attempts
                              </span>
                              <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                                {quiz.attempts || 0}
                              </span>
                            </div> */}

                            <div className="flex flex-col">
                              <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                                <BarChart2 className="w-4 h-4 text-gray-400" /> Course Id
                              </span>
                              <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                                {quiz.course_id}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                                <Clock className="w-4 h-4 text-gray-400" /> Duration
                              </span>
                              <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                                {quiz.time || "45m"}
                              </span>
                            </div>
                          </div>

                          <hr className="border-gray-100 mb-5" />

                          {/* Action Buttons */}
                          <div className="flex flex-row gap-1 sm:gap-2 w-full mt-auto">
                            <Button
                              className="flex-1 h-7 px-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[11.5px] sm:text-[12.5px] shadow-sm rounded-[8px] min-w-0"
                              onClick={() => navigate(`/quizzes/${quiz.id}/view`)}
                            >
                              <Eye className="w-[12px] h-[12px] mr-1 shrink-0" />
                              <span className="truncate">View</span>
                            </Button>

                            <Button
                              variant="outline"
                              className="flex-1 h-7 px-0 border-[1.5px] border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold text-[11.5px] sm:text-[12.5px] shadow-sm rounded-[8px] min-w-0"
                              onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                            >
                              <Pencil className="w-[12px] h-[12px] mr-1 shrink-0" />
                              <span className="truncate">Edit</span>
                            </Button>

                            <Button
                              variant="outline"
                              className="flex-1 h-7 px-0 border-[1.5px] border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold text-[11.5px] sm:text-[12.5px] shadow-sm rounded-[8px] min-w-0"
                              onClick={() => handleDelete(quiz.id)}
                            >
                              <Trash2 className="w-[12px] h-[12px] mr-1 shrink-0" />
                              <span className="truncate">Delete</span>
                            </Button>
                          </div>

                          {/* Updated Date */}
                          {quiz.updated_at && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-5">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Updated {formatDate(quiz.updated_at)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-6">
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
              {Array.from({ length: Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE) }).map((_, idx) => (
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
              disabled={currentPage === Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE)}
              onClick={() => {
                setCurrentPage((prev) => Math.min(Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE), prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 h-10 border-slate-200 text-slate-600 rounded-xl"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
