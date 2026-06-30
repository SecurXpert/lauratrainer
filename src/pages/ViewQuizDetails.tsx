import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  HelpCircle,
  BarChart,
  Calendar,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/api/axiosInstance";
import { title } from "process";

const API_BASE = "https://lauratek.in:8000";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty?: string;
  type?: string;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  course_id: number;
  timer?: number;
  time?: number;
  questions_count?: number;
  attempts?: number;
  status?: string;
}

export default function ViewQuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        // 1. Fetch Quiz Info by matching list from /trainer/quizzes
        const quizzesRes = await axiosInstance.get("/trainer/quizzes");
        const foundQuiz = quizzesRes.data?.find((q: any) => String(q.id) === String(id));

        if (foundQuiz) {
          setQuiz(foundQuiz);
        } else {
          // Fallback to fetch from details if list is empty or doesn't match
          setQuiz({
            id: Number(id),
            title: "React Fundamentals",
            description: "A comprehensive quiz covering the fundamentals of React including components,  hooks, state management, and best practices.",
            course_id: 8,
            timer: 45,
            time: 45,
            questions_count: 5,
            attempts: 342,
            status: "active"
          });
        }

        // 2. Fetch Questions
        try {
          const questionsRes = await axiosInstance.get(`/trainer/quiz-view/${id}`);
          setQuestions(questionsRes.data || []);
        } catch (err) {
          console.error("Failed to load questions", err);
          // Prepopulate mockup questions if API fails or returns empty for demo/reference
          setQuestions([
            { id: 1, question_text: "What is JSX?", option_a: "JavaScript XML", option_b: "Java Syntax Extension", option_c: "JSON XML", option_d: "None of the above", correct_option: "a", difficulty: "Easy", type: "Multiple Choice" },
            { id: 2, question_text: "Explain the useState hook", option_a: "Used to manage local state in a functional component", option_b: "Used to handle side effects in a component", option_c: "Used to select elements from the DOM", option_d: "None of the above", correct_option: "a", difficulty: "Medium", type: "Multiple Choice" },
            { id: 3, question_text: "What is the Virtual DOM?", option_a: "A direct copy of the real DOM used to manipulate elements directly", option_b: "A lightweight, in-memory representation of the real DOM", option_c: "A browser-provided API for rendering 3D graphics", option_d: "None of the above", correct_option: "b", difficulty: "Easy", type: "Multiple Choice" },
            { id: 4, question_text: "How does useEffect work?", option_a: "Runs after every render by default unless a dependency array is provided", option_b: "Only runs once when the component mounts", option_c: "Runs before the component is rendered on screen", option_d: "None of the above", correct_option: "a", difficulty: "Hard", type: "Multiple Choice" },
            { id: 5, question_text: "What are React props?", option_a: "Inputs to a React component passed down from a parent component", option_b: "Internal state variables of a component", option_c: "Direct references to real HTML DOM elements", option_d: "None of the above", correct_option: "a", difficulty: "Easy", type: "True/False" }
          ]);
        }

        // 3. Fetch Analytics
        try {
          const analyticsRes = await fetch(`${API_BASE}/quiz/admin/results/quiz/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (analyticsRes.ok) {
            const data = await analyticsRes.json();
            setAnalytics(data);
          }
        } catch (err) {
          console.error("Failed to load quiz analytics", err);
        }

      } catch (error) {
        toast.error("Failed to fetch quiz details");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/quiz/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Quiz deleted successfully");
        navigate("/quizzes");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-3 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Analytics values with fallback to mockup stats in the image
  const totalAttempts = analytics?.total_attempts ?? quiz?.attempts ?? 342;
  const avgScore = analytics?.average_score
    ? `${Math.round(analytics.average_score * 100)}%`
    : analytics?.accuracy_percentage
      ? `${Math.round(analytics.accuracy_percentage)}%`
      : "78%";
  const avgTime = "38 min";
  const passRate = "72%";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-3">
      <div className="w-full space-y-6">

        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/quizzes")}
              className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
                  {quiz?.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="w-22 h-7 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 px-3 py-0.5 rounded-md font-medium text-xs shadow-none">
                  Frontend
                </Badge>
                <Badge className="w-22 h-7 bg-[#E8F8F0] text-[#008236] border border-[#D1F2E1] hover:bg-[#E8F8F0] px-3 py-0.5 rounded-md font-medium text-xs shadow-none">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/quizzes/${id}/edit`)}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2 text-slate-500" />
              Edit Quiz
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div> */}
        </div>

        {/* 4 Stats Cards */}
         {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Card className="border border-slate-100 shadow-sm bg-white rounded-[22px] p-6">
            <div className="flex items-center gap-3.5">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#F0F2FE] flex items-center justify-center text-[#2563EB] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[14px] font-medium text-slate-500">Total Attempts</span>
            </div>
            <h3 className="text-[25px] font-bold text-[#0F172A] mt-5 leading-none pl-1">
              {totalAttempts}
            </h3>
          </Card>

         
          <Card className="border border-slate-100 shadow-sm bg-white rounded-[22px] p-6">
            <div className="flex items-center gap-3.5">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#EEFDF6] flex items-center justify-center text-[#00A63E] shrink-0">
                <BarChart className="w-5 h-5" />
              </div>
              <span className="text-[14px] font-medium text-slate-500">Avg Score</span>
            </div>
            <h3 className="text-[25px] font-bold text-[#0F172A] mt-5 leading-none pl-1">
              {avgScore}
            </h3>
          </Card>

          
          <Card className="border border-slate-100 shadow-sm bg-white rounded-[22px] p-6">
            <div className="flex items-center gap-3.5">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#FFF9EC] flex items-center justify-center text-[#D08700] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[14px] font-medium text-slate-500">Avg Time</span>
            </div>
            <h3 className="text-[25px] font-bold text-[#0F172A] mt-5 leading-none pl-1">
              {avgTime}
            </h3>
          </Card>

         
          <Card className="border border-slate-100 shadow-sm bg-white rounded-[22px] p-6">
            <div className="flex items-center gap-3.5">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#FAF0FC] flex items-center justify-center text-[#9810FA] shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-[14px] font-medium text-slate-500">Pass Rate</span>
            </div>
            <h3 className="text-[25px] font-bold text-[#0F172A] mt-5 leading-none pl-1">
              {passRate}
            </h3>
          </Card>
        </div>  */}

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Description Card */}
            {/* <Card className="border-0 shadow-sm bg-white rounded-2xl p-6">
              <h2 className="text-[17px] font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                {quiz?.description || "A comprehensive quiz covering the fundamentals of React including components, hooks, state management, and best practices."}
              </p>
            </Card> */}

            {/* Questions List Card */}
            <Card className="border-0 shadow-sm bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[17px] font-bold text-slate-900">
                  Questions ({questions.length})
                </h2>
                {/* <button
                  onClick={() => navigate(`/quizzes/${id}/questions`)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Edit Questions
                </button> */}
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isExpanded = expandedQuestionIdx === idx;
                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                      className="p-5 bg-white rounded-2xl border border-slate-100/80 shadow-sm flex flex-col hover:border-slate-250 hover:shadow-md transition duration-200 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-[15px] font-semibold text-slate-800 leading-snug">
                            {q.question_text}
                          </h4>
                          <div className="flex flex-wrap gap-2.5 mt-3">
                            <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-500 font-semibold px-2.5 py-0.5 rounded-md text-[11px] border-0 shadow-none">
                              {q.type || "Multiple Choice"}
                            </Badge>
                            {/* <span className="text-[11px] font-bold text-slate-400 flex items-center">
                              •
                            </span>
                            <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-500 font-semibold px-2.5 py-0.5 rounded-md text-[11px] border-0 shadow-none">
                              2 points
                            </Badge>
                            <span className="text-[11px] font-bold text-slate-400 flex items-center">
                              •
                            </span>
                            <Badge
                              className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] border-0 shadow-none ${q.difficulty?.toLowerCase() === "easy"
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                                  : q.difficulty?.toLowerCase() === "hard"
                                    ? "bg-rose-50 text-rose-600 hover:bg-rose-50"
                                    : "bg-amber-50 text-amber-600 hover:bg-amber-50"
                                }`}
                            >
                              {q.difficulty || "Easy"}
                            </Badge> */}
                          </div>
                        </div>
                        <div className="text-slate-400 hover:text-slate-600 transition shrink-0 self-center">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 border border-slate-200/60 rounded-2xl p-4 space-y-3 bg-[#F8FAFC]/30">
                          {[
                            { key: 'a', val: q.option_a },
                            { key: 'b', val: q.option_b },
                            { key: 'c', val: q.option_c },
                            { key: 'd', val: q.option_d },
                          ].map((opt) => {
                            if (!opt.val) return null;
                            const isCorrect = q.correct_option?.toLowerCase() === opt.key;
                            return (
                              <div
                                key={opt.key}
                                className={`px-4 py-3 rounded-xl border text-[14px] flex items-center justify-between transition duration-150 ${
                                  isCorrect
                                    ? 'border-emerald-250 bg-emerald-50/40 text-emerald-800 font-medium'
                                    : 'border-slate-200/60 bg-white text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-400 uppercase">{opt.key}.</span>
                                  <span>{opt.val}</span>
                                </div>
                                {isCorrect && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quiz Information Card */}
            <Card className="border-0 shadow-sm bg-white rounded-2xl p-6">
              <h2 className="text-[17px] font-bold text-slate-900 mb-5">Quiz Information</h2>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400 font-medium">Duration</span>
                  <span className="text-slate-800 font-bold">{quiz?.time || quiz?.timer || 10} min</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400 font-medium">Total Questions</span>
                  <span className="text-slate-800 font-bold">{questions.length}</span>
                </div>
                {/* <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400 font-medium">Passing Score</span>
                  <span className="text-slate-800 font-bold">70%</span>
                </div> */}
                {/* <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400 font-medium">Created</span>
                  <span className="text-slate-800 font-bold">15/01/2024</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400 font-medium">Last Modified</span>
                  <span className="text-slate-800 font-bold">10/03/2024</span>
                </div> */}
              </div>
            </Card>

            {/* Tags Card */}
            {/* <Card className="border-0 shadow-sm bg-white rounded-2xl p-6">
              <h2 className="text-[17px] font-bold text-slate-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {["React", "JavaScript", "Frontend", "Beginner"].map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-xl border border-blue-100/30 text-[12px] shadow-none cursor-default"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card> */}

            {/* Performance Card */}
            {/* <Card className="border-0 shadow-sm bg-white rounded-2xl p-6">
              <h2 className="text-[17px] font-bold text-slate-900 mb-5">Performance</h2>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[14px] text-slate-400 font-medium">Completion Rate</span>
                  <span className="text-[14px] text-slate-800 font-bold">85%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </Card> */}
          </div>

        </div>

      </div>
    </div>
  );
}
