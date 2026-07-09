import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { Quiz, QuizzesStatsType, getQuizStatus } from "../components/Quizzes/QuizzesTypes";
import QuizzesHeader from "../components/Quizzes/QuizzesHeader";
import QuizzesStats from "../components/Quizzes/QuizzesStats";
import QuizzesFilters from "../components/Quizzes/QuizzesFilters";
import QuizzesGrid from "../components/Quizzes/QuizzesGrid";
import QuizzesPagination from "../components/Quizzes/QuizzesPagination";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Stats
  const [stats, setStats] = useState<QuizzesStatsType>({
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
      if (data.length > 0) {
        fetch('http://localhost:3002', { method: 'POST', body: JSON.stringify(data[0]) }).catch(()=>console.log(data[0]));
      }
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
        <QuizzesHeader />

        <QuizzesStats 
          stats={stats}
          statsLoading={statsLoading}
        />

        <QuizzesFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setCurrentPage={setCurrentPage}
        />

        <QuizzesGrid 
          loading={loading}
          error={error}
          filteredQuizzes={filteredQuizzes}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          handleDelete={handleDelete}
        />

        <QuizzesPagination 
          loading={loading}
          error={error}
          filteredQuizzesLength={filteredQuizzes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
