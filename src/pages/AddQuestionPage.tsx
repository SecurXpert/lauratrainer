import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  FileQuestion,
  HelpCircle,
  Tag,
  Check,
  Save,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Quiz {
  id: number;
  title: string;
}

export default function AddQuestionPage() {
  const navigate = useNavigate();
  const { id: urlQuizId } = useParams();
  const [searchParams] = useSearchParams();
  const quizIdFromQuery = searchParams.get("quizId");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState(urlQuizId || quizIdFromQuery || "");
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Question Form State
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionE, setOptionE] = useState("");
  const [optionF, setOptionF] = useState("");
  const [correctOption, setCorrectOption] = useState(""); // 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  const [activeOptions, setActiveOptions] = useState<string[]>(["a", "b"]);

  // Extra settings (matching backend parameters)
  const [difficulty, setDifficulty] = useState("Easy");
  const [points, setPoints] = useState("2");
  const [timeLimit, setTimeLimit] = useState("60");
  const [questionType, setQuestionType] = useState("Multiple Choice");

  // Fetch Quizzes for selection
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axiosInstance.get("/trainer/quizzes");
        const data = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
        setQuizzes(data);
      } catch (err) {
        toast.error("Failed to fetch quizzes");
      }
    };
    fetchQuizzes();
  }, []);

  // Sync correct option letter between select dropdown/text field and options state
  const handleCorrectOptionTextChange = (val: string) => {
    const lower = val.trim().toLowerCase();
    if (lower === "" || activeOptions.includes(lower)) {
      setCorrectOption(lower);
    }
  };

  // Dynamic Option Add/Delete Management
  const addOption = () => {
    if (activeOptions.length >= 6) {
      toast.info("Maximum of 6 options allowed.");
      return;
    }
    const nextKeys = ["a", "b", "c", "d", "e", "f"];
    const nextKey = nextKeys[activeOptions.length];
    setActiveOptions((prev) => [...prev, nextKey]);
  };

  const deleteOption = (key: string) => {
    if (activeOptions.length <= 2) {
      toast.error("At least 2 options are required.");
      return;
    }

    if (key === "a") {
      setOptionA(optionB);
      setOptionB(optionC);
      setOptionC(optionD);
      setOptionD(optionE);
      setOptionE(optionF);
      setOptionF("");
    } else if (key === "b") {
      setOptionB(optionC);
      setOptionC(optionD);
      setOptionD(optionE);
      setOptionE(optionF);
      setOptionF("");
    } else if (key === "c") {
      setOptionC(optionD);
      setOptionD(optionE);
      setOptionE(optionF);
      setOptionF("");
    } else if (key === "d") {
      setOptionD(optionE);
      setOptionE(optionF);
      setOptionF("");
    } else if (key === "e") {
      setOptionE(optionF);
      setOptionF("");
    } else if (key === "f") {
      setOptionF("");
    }
    
    setActiveOptions((prev) => prev.slice(0, -1));

    if (correctOption === key) {
      setCorrectOption("");
    } else {
      const keys = ["a", "b", "c", "d", "e", "f"];
      const keyIndex = keys.indexOf(key);
      const correctIndex = keys.indexOf(correctOption);
      if (correctIndex > keyIndex) {
        setCorrectOption(keys[correctIndex - 1]);
      }
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      toast.error("Please enter or select a Quiz ID");
      return;
    }
    if (!questionText.trim()) {
      toast.error("Please enter the question text");
      return;
    }
    if (!optionA.trim() || !optionB.trim()) {
      toast.error("Please enter at least Option A and Option B");
      return;
    }
    if (!correctOption || !activeOptions.includes(correctOption.toLowerCase())) {
      toast.error("Please specify a correct option from the active options list");
      return;
    }

    setAddingQuestion(true);
    try {
      const formData = new FormData();
      formData.append("quiz_id", selectedQuizId);
      formData.append("question_text", questionText.trim());
      formData.append("option_a", optionA.trim());
      formData.append("option_b", optionB.trim());
      formData.append("option_c", optionC.trim());
      formData.append("option_d", optionD.trim());
      formData.append("option_e", optionE.trim());
      formData.append("option_f", optionF.trim());
      formData.append("correct_option", correctOption.toLowerCase());
      formData.append("difficulty", difficulty);
      formData.append("points", points);
      formData.append("time_limit", timeLimit);
      formData.append("type", questionType);

      await axiosInstance.post("/trainer/questions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Question added successfully!");
      navigate(`/quizzes/${selectedQuizId}/view`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to add question");
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleCancel = () => {
    if (selectedQuizId) {
      navigate(`/quizzes/${selectedQuizId}/view`);
    } else {
      navigate("/quizzes");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-3">
      <div className="w-full space-y-6">

        {/* Top Navigation */}
        <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-6 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 space-y-4">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-6 py-2.5  hover:bg-[#E5DBFF] text-[#7C3AED] font-semibold text-sm rounded-lg transition duration-150 cursor-pointer border-0 shadow-none"
          >
            <ArrowLeft className="w-4 h-4 text-[#7C3AED]" />
            Back to Guest Quizzes
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
                  Add Question
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Create a new question for guest quizzes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveQuestion}
                disabled={addingQuestion}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 text-[16px]"
              >
                {addingQuestion ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" strokeWidth={2} />
                )}
                Save Question
              </Button>
            </div>
          </div>
        </div>

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Details and Options) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Question Details Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)",
                    boxShadow: "0 8px 20px -4px rgba(59, 95, 235, 0.45)"
                  }}
                  className="w-11 h-11 rounded-[16px] flex items-center justify-center text-white shrink-0"
                >
                  <HelpCircle className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Question Details</h2>
                  <p className="text-xs text-slate-400">Question text and type</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Quiz ID / Select Quiz */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Quiz ID</Label>
                  {quizzes.length > 0 ? (
                    <select
                      value={selectedQuizId}
                      onChange={(e) => setSelectedQuizId(e.target.value)}
                      className="w-full mt-2 h-11 rounded-xl bg-slate-50 border-0 px-3 text-sm focus:outline-none transition cursor-pointer"
                    >
                      <option value="">Select a Quiz</option>
                      {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title} (ID: {q.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      maxLength={6}
                      value={selectedQuizId}
                      onChange={(e) => setSelectedQuizId(e.target.value.replace(/\D/g, ''))}
                      placeholder="Quiz id"
                      className="mt-2 h-11 rounded-xl bg-slate-50 border-0 transition"
                    />
                  )}
                </div>

                {/* Question Text */}
                <div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-slate-700">Question <span className="text-red-500">*</span></Label>
                  </div>
                  <Textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question here..."
                    rows={4}
                    maxLength={180}
                    className="mt-2 rounded-xl bg-slate-50 border-0 resize-none transition"
                  />
                </div>

                {/* Option Inputs A, B, C, D, E, F */}
                <div className="space-y-3">
                  {[
                    { key: "a", label: "A", val: optionA, setVal: setOptionA },
                    { key: "b", label: "B", val: optionB, setVal: setOptionB },
                    { key: "c", label: "C", val: optionC, setVal: setOptionC },
                    { key: "d", label: "D", val: optionD, setVal: setOptionD },
                    { key: "e", label: "E", val: optionE, setVal: setOptionE },
                    { key: "f", label: "F", val: optionF, setVal: setOptionF },
                  ].filter(opt => activeOptions.includes(opt.key)).map((opt) => (
                    <div key={opt.key} className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                        {opt.label}
                      </div>
                      <Input
                        type="text"
                        value={opt.val}
                        onChange={(e) => opt.setVal(e.target.value)}
                        placeholder={`Option ${opt.label}`}
                        className="bg-transparent border-0 h-9 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm shadow-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Option text box */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Correct Option (A-{activeOptions[activeOptions.length - 1].toUpperCase()})</Label>
                  <Input
                    type="text"
                    value={correctOption.toUpperCase()}
                    onChange={(e) => handleCorrectOptionTextChange(e.target.value)}
                    placeholder={`Correct option (A-${activeOptions[activeOptions.length - 1].toUpperCase()})`}
                    className="mt-2 h-11 rounded-xl bg-slate-50 border-0 transition"
                    maxLength={1}
                  />
                </div>

              </div>
            </div>

            {/* Answer Options Card */}
            <div className="bg-white rounded-[24px] border border-slate-100/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      background: "linear-gradient(135deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)",
                      boxShadow: "0 8px 20px -4px rgba(59, 95, 235, 0.45)"
                    }}
                    className="w-11 h-11 rounded-[16px] flex items-center justify-center text-white shrink-0"
                  >
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Add Options</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Provide multiple choice answers</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addOption}
                  className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-sm font-semibold h-[38px] px-4 rounded-xl border-0 shadow-none flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-4">
                {/* Options List for Selection & Sync */}
                {[
                  { key: "a", label: "A", val: optionA, setVal: setOptionA },
                  { key: "b", label: "B", val: optionB, setVal: setOptionB },
                  { key: "c", label: "C", val: optionC, setVal: setOptionC },
                  { key: "d", label: "D", val: optionD, setVal: setOptionD },
                  { key: "e", label: "E", val: optionE, setVal: setOptionE },
                  { key: "f", label: "F", val: optionF, setVal: setOptionF },
                ].filter(opt => activeOptions.includes(opt.key)).map((opt) => {
                  const isCorrect = correctOption === opt.key;
                  return (
                    <div key={opt.key} className="flex items-center gap-4 w-full">
                      {/* Main Option Card */}
                      <div className="flex-1 flex items-center gap-4 bg-[#F8FAFC]/40 p-3 rounded-[16px] border border-[#E2E8F0] hover:bg-[#F8FAFC]/70 transition duration-150">
                        {/* Circle badge */}
                        <button
                          type="button"
                          onClick={() => setCorrectOption(opt.key)}
                          className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-sm shrink-0 transition duration-150 ${
                            isCorrect
                              ? "border-emerald-500 text-emerald-600 bg-emerald-50/50 shadow-sm"
                              : "border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
                          }`}
                          title="Mark as correct answer"
                        >
                          {opt.label}
                        </button>
                        {/* Input field */}
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={opt.val}
                            onChange={(e) => opt.setVal(e.target.value)}
                            placeholder={`Option ${opt.label}`}
                            className="bg-white border border-[#E2E8F0] focus-visible:border-purple-500 rounded-[12px] h-10 px-4 text-sm text-slate-700 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        {/* Correct Answer Badge */}
                        {isCorrect && (
                          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-100 text-emerald-600 text-xs font-semibold shadow-sm shrink-0">
                            Correct Answer
                          </span>
                        )}
                      </div>

                      {/* Delete button outside card */}
                      <button
                        type="button"
                        onClick={() => deleteOption(opt.key)}
                        className="p-3 bg-red-50 text-[#EF4444] hover:bg-red-100 hover:text-[#B91C1C] rounded-[12px] transition duration-150 shrink-0 border-0 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (Question Info & Tips) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Question Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)",
                    boxShadow: "0 8px 20px -4px rgba(59, 95, 235, 0.45)"
                  }}
                  className="w-11 h-11 rounded-[16px] flex items-center justify-center text-white shrink-0"
                >
                  <Tag className="w-5.5 h-5.5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Question Info</h2>
              </div>

              <div className="space-y-4 text-sm font-medium">

                {/* Type Display */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Type</span>
                  <span className="h-8 flex items-center justify-center rounded-lg bg-blue-50 px-2.5 text-xs font-bold text-blue-600">
                    Multiple Choice
                  </span>
                </div>
                {/* Options Count */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Options</span>
                  <span className="text-slate-900 font-bold">
                    {activeOptions.length}
                  </span>
                </div>

                {/* Correct Answer badge */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Correct Answer</span>
                  <span className="text-slate-950 font-bold text-base">
                    {correctOption ? correctOption.toUpperCase() : "—"}
                  </span>
                </div>

              </div>
            </div>

            {/* Quick Tips Container */}
            <div className="bg-[#F4F7FF] rounded-2xl border border-blue-100/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quick Tips:</h3>
              <ul className="space-y-3.5 text-sm font-medium text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-500 mt-0.5 font-bold">✓</span>
                  <span>Keep questions clear and concise</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-500 mt-0.5 font-bold">✓</span>
                  <span>Ensure only one correct answer</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-500 mt-0.5 font-bold">✓</span>
                  <span>Avoid ambiguous wording</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
