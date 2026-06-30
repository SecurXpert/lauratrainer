import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  FileText,
  CheckCircle2,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "a" | "b" | "c" | "d";
  difficulty?: string;
  type?: string;
  file_url?: string;
}

interface Quiz {
  id: number;
  title: string;
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const { id: urlQuizId } = useParams();

  const [selectedQuizId, setSelectedQuizId] = useState(urlQuizId || "");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );

  // Modal state (kept for potential future use)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "a" as "a" | "b" | "c" | "d",
    difficulty: "Medium",
    points: 10,
    time_limit: 60,
  });
  const [addingQuestion, setAddingQuestion] = useState(false);

  const quizId = urlQuizId || selectedQuizId;

  // Fetch Quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await axiosInstance.get("/trainer/quizzes");
      const data = Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.data) ? res.data.data : []);
      setQuizzes(data);
    } catch (err) {
      toast.error("Failed to fetch quizzes");
    }
  };

  // Fetch Questions for selected quiz
  const fetchQuestions = async (targetQuizId: string) => {
    if (!targetQuizId) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(`/trainer/quiz-view/${targetQuizId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.data) ? res.data.data : []);
      setQuestions(data);
      setSelectedQuestion(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizId) {
      fetchQuestions(quizId);
    }
  }, [quizId]);

  const filteredQuestions = Array.isArray(questions) ? questions.filter((q) =>
    (q?.question_text || "").toLowerCase().includes(searchTerm.toLowerCase()),
  ) : [];

  const handleBulkUpload = () => {
    const returnPath = urlQuizId
      ? `/quizzes/${urlQuizId}/questions`
      : "/quizzes/questions";
    navigate("/quizzes/bulk-upload", { state: { returnPath } });
  };

  const handleAddQuestionClick = () => {
    if (!quizId) {
      toast.error("Please select a quiz first");
      return;
    }
    navigate(`/quizzes/${quizId}/add-question`);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await axiosInstance.delete(`/trainer/questions/${questionId}`);
      toast.success("Question deleted successfully");
      fetchQuestions(quizId);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete question");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-sm sm:text-base text-gray-500">Manage and preview your questions</p>
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <Button
              variant="outline"
              onClick={handleBulkUpload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-[40px] px-7 rounded-[10px] border-2 border-[#2563eb] bg-white text-[#2563eb] hover:bg-[#2563eb] hover:text-white active:bg-[#1d4ed8] transition-all duration-200 shadow-none font-medium text-[14px] sm:text-[16px]" >
              <Upload className="w-5 h-5" />
              <span>Bulk Upload CSV</span>
            </Button>
            <Button
              onClick={handleAddQuestionClick}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 shadow-[0_10px_22px_rgba(126,58,242,0.35)] text-[14px] sm:text-[16px] h-[40px]"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar with Quiz Selector */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          {/* Quiz Selector - shown when no quizId from URL */}
          {!urlQuizId && (
            <div className="w-full sm:w-64">
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Select a Quiz</option>
                {Array.isArray(quizzes) && quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id.toString()}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {quizId && (
            <>
              <div className="w-full sm:flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap sm:ml-auto">
                {filteredQuestions.length} questions
              </div>
            </>
          )}
        </div>

        {quizId ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Question List */}
            <div className="lg:col-span-5">
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader2
                          className="animate-spin text-blue-600"
                          size={28}
                        />
                      </div>
                    ) : filteredQuestions.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        No questions found
                      </div>
                    ) : (
                      filteredQuestions.map((q, index) => (
                        <div
                          key={q.id}
                          onClick={() => setSelectedQuestion(q)}
                          className={`p-5 border-b hover:bg-gray-50 cursor-pointer transition ${selectedQuestion?.id === q.id ? "bg-blue-50" : ""
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-medium text-gray-400 mt-1">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-2 leading-snug">
                                {q.question_text}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                                  React
                                </span>
                                <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                                  {q.difficulty || "Medium"}
                                </span>
                                <span className="text-xs px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                                  Multiple Choice
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Question Preview */}
            <div className="lg:col-span-7">
              {selectedQuestion ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        React
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Medium
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Multiple Choice
                      </span>
                    </div>

                    <h2 className="text-xl font-semibold leading-tight mb-8">
                      {selectedQuestion.question_text}
                    </h2>

                    <div className="space-y-3 mb-10">
                      {["a", "b", "c", "d"].map((opt) => {
                        const isCorrect = selectedQuestion.correct_option === opt;
                        const optionText = selectedQuestion[
                          `option_${opt}` as keyof Question
                        ] as string;
                        return (
                          <div
                            key={opt}
                            className={`p-4 rounded-xl border flex items-start gap-4 ${isCorrect
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200"
                              }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium mt-0.5 ${isCorrect
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-500"
                                }`}
                            >
                              {opt.toUpperCase()}
                            </div>
                            <div className="flex-1 text-sm">{optionText}</div>
                            {isCorrect && (
                              <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Correct
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px] border-dashed bg-white">
                  <div className="text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3" />
                    <p>Select a question from the list</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm">
            <div className="text-center max-w-md mx-auto px-4 space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Select a Quiz</h2>
              <p className="text-gray-500 text-sm">
                Choose a quiz from the dropdown above to load its questions, search the bank, and view question previews.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
