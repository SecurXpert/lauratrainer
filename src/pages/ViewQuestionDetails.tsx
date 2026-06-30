import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Code, ClipboardList, Lightbulb, ChevronLeft } from "lucide-react";
import { LuSparkles } from "react-icons/lu";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";

interface TestCase {
  testcase: number;
  input: string;
  output: string;
  explanation?: string;
}

interface QuestionBankItem {
  id: number;
  question_id?: number;
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: TestCase[];
  suggestion: string[];
}

export default function ViewQuestionDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [question, setQuestion] = useState<QuestionBankItem | null>(null);
  const [loading, setLoading] = useState(false);

  const questionId = location.state?.questionId;

  useEffect(() => {
    if (questionId) fetchQuestionDetails(questionId);
    else if (location.state?.question) setQuestion(location.state.question);
  }, [questionId]);

  const fetchQuestionDetails = async (id: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_BASE_URL}/compiler-questions/get?question_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch question");

      const data = await res.json();
      const foundQuestion = Array.isArray(data) 
        ? (data.find((q: QuestionBankItem) => (q.question_id || q.id) === id) || data[0])
        : data;

      if (foundQuestion) setQuestion(foundQuestion);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading question details...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Question not found</p>
          <Button onClick={() => navigate("/exam-management")}>
            Back to Exam Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 font-sans">
      {/* Page Header */}
      <div className="w-full">
        <Button 
          onClick={() => navigate("/exam-management")} 
          variant="ghost" 
          className="mb-6 text-slate-500 rounded-full text-[#7c3aed] bg-[#f3e8ff] hover:bg-[#e9d5ff] hover:text-[#6d28d9] transition-all duration-200 shadow-none font-semibold text-[15px] px-3 py-5"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Exam Management
        </Button>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-300/60">
            <LuSparkles className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-[30px] leading-none font-bold text-[#111827]">
              Exam Management
            </h1>
            <p className="text-[15px] text-slate-500 mt-2">
              Manage coding questions and create exams
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm mb-8">
          <button
            type="button"
            onClick={() => navigate('/exam-management', { state: { activeTab: 'questions' } })}
            className="px-8 py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-400/40 transition-all hover:shadow-purple-400/60"
          >
            Question Bank
          </button>
          <button
            type="button"
            onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })}
            className="px-8 py-3 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Exams
          </button>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-[22px] shadow-xl shadow-slate-200/70 overflow-hidden">
          {/* Purple Title Header */}
          <div className="h-[98px] bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 md:px-8 flex items-center gap-4 text-white">
            <button
              onClick={() => navigate("/exam-management")}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-[24px] font-bold leading-tight">
                {question.title}
              </h2>
              <p className="text-sm text-white/90 mt-1">Question Details</p>
            </div>
          </div>

          <div className="px-7 md:px-8 py-8">
            {/* Tags */}
            <div className="flex gap-3 mb-7">
              <span className="px-4 py-1.5 rounded-full bg-[#dcfce7] text-[#16a34a] text-sm font-semibold">
                Easy
              </span>
              <span className="px-4 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-sm font-semibold">
                Arrays
              </span>
            </div>

            {/* Problem Statement */}
            <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#111827] mb-4">
              <Code className="w-5 h-5 text-purple-600" />
              Problem Statement
            </h3>

            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6 text-[15px] text-slate-700 leading-7 whitespace-pre-wrap mb-10">
              {question.question || "No problem statement provided."}
            </div>

            {/* Test Cases */}
            {question.test_cases?.length > 0 && (
              <div className="mb-10">
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#111827] mb-4">
                  <ClipboardList className="w-5 h-5 text-green-500" />
                  Test Cases
                </h3>

                <div className="space-y-4">
                  {question.test_cases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="bg-[#ecfdf5] border border-[#bbf7d0] rounded-2xl p-5"
                    >
                      <p className="text-sm font-semibold text-slate-700 mb-4">
                        Test Case {idx + 1}
                      </p>

                      <div className="space-y-3">
                        <div className="bg-white rounded-xl border border-emerald-100 p-4">
                          <p className="text-xs text-slate-400 mb-1">Input:</p>
                          <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap">
                            {tc.input}
                          </pre>
                        </div>

                        <div className="bg-white rounded-xl border border-emerald-100 p-4">
                          <p className="text-xs text-slate-400 mb-1">Output:</p>
                          <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap">
                            {tc.output}
                          </pre>
                        </div>

                        <div className="bg-white rounded-xl border border-emerald-100 p-4">
                          <p className="text-xs text-slate-400 mb-1">
                            Explanation:
                          </p>
                          <p className="text-sm text-slate-700">
                            {tc.explanation ||
                              "Because nums[0] + nums[1] == 9, we return [0, 1]."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {question.suggestion?.length > 0 && question.suggestion[0] !== "" && (
              <div className="mb-10">
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#111827] mb-4">
                  <Lightbulb className="w-5 h-5 text-orange-500" />
                  Suggestions
                </h3>

                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-5">
                  <div className="space-y-4">
                    {question.suggestion.map((sug, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#fde68a] text-[#b45309] flex items-center justify-center text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-700 leading-6">
                          {sug}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Constraints */}
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-4">
                Constraints
              </h3>

              <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6">
                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      2 ≤ nums.length ≤ 10⁴
                    </code>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      -10⁹ ≤ nums[i] ≤ 10⁹
                    </code>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      -10⁹ ≤ target ≤ 10⁹
                    </code>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Only one valid answer exists.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-start mt-8 pb-8">
        </div>
      </div>
    </div>
  );
}