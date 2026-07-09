import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { ArrowLeft, Loader2, Info, Clock, Hash, Settings, Plus, Trash2, HelpCircle, Tag, FileQuestion, ChevronDown } from "lucide-react";
import { LuFileQuestion } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Question {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  points: string;
  time_limit: string;
  type: string;
}

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState("");
  const [quizCategory, setQuizCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Questions list state
  const [questions, setQuestions] = useState<Question[]>([]);

  // Courses list state
  interface Course {
    id: number;
    title: string;
  }
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get("/trainer/courses");
        setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Question form states
  const [currQuestionText, setCurrQuestionText] = useState("");
  const [currOptionA, setCurrOptionA] = useState("");
  const [currOptionB, setCurrOptionB] = useState("");
  const [currOptionC, setCurrOptionC] = useState("");
  const [currOptionD, setCurrOptionD] = useState("");
  const [currCorrectOption, setCurrCorrectOption] = useState("");
  const [currDifficulty, setCurrDifficulty] = useState("Easy");
  const [currPoints, setCurrPoints] = useState("2");
  const [currTimeLimit, setCurrTimeLimit] = useState("60");
  const [currType, setCurrType] = useState("Multiple Choice");

  const handleAddQuestionToList = () => {
    if (!currQuestionText.trim()) {
      toast.error("Please enter the question text");
      return;
    }
    if (!currOptionA.trim() || !currOptionB.trim()) {
      toast.error("Please enter at least Option A and Option B");
      return;
    }
    if (!currCorrectOption) {
      toast.error("Please select a correct option (A, B, C, or D)");
      return;
    }

    const newQuestion: Question = {
      question_text: currQuestionText.trim(),
      option_a: currOptionA.trim(),
      option_b: currOptionB.trim(),
      option_c: currOptionC.trim(),
      option_d: currOptionD.trim(),
      correct_option: currCorrectOption.toLowerCase(),
      difficulty: currDifficulty,
      points: currPoints,
      time_limit: currTimeLimit,
      type: currType,
    };

    setQuestions([...questions, newQuestion]);

    // Reset current form
    setCurrQuestionText("");
    setCurrOptionA("");
    setCurrOptionB("");
    setCurrOptionC("");
    setCurrOptionD("");
    setCurrCorrectOption("");
    setCurrDifficulty("Easy");
    setCurrPoints("2");
    setCurrTimeLimit("60");
    setCurrType("Multiple Choice");
    toast.success("Question added to local list");
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
    toast.info("Question removed");
  };

  const isFormValid =
    title.trim() &&
    courseId.trim() &&
    !isNaN(Number(courseId)) &&
    Number(courseId) > 0 &&
    title.length <= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg("Please fill all required fields correctly.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    formData.append("course_id", courseId.trim());
    if (duration) {
      formData.append("timer", duration);
    }
    if (quizCategory.trim()) {
      formData.append("category", quizCategory.trim());
    }

    try {
      const res = await axiosInstance.post("/subadmin/quizzes", formData);
      const quizId = res.data?.id;

      if (quizId && description.trim()) {
        localStorage.setItem(`quiz_desc_${quizId}`, description.trim());
      }

      if (quizId && questions.length > 0) {
        for (const q of questions) {
          const qFormData = new FormData();
          qFormData.append("quiz_id", String(quizId));
          qFormData.append("question_text", q.question_text);
          qFormData.append("option_a", q.option_a);
          qFormData.append("option_b", q.option_b);
          qFormData.append("option_c", q.option_c);
          qFormData.append("option_d", q.option_d);
          qFormData.append("correct_option", q.correct_option);
          qFormData.append("difficulty", q.difficulty);
          qFormData.append("points", q.points);
          qFormData.append("time_limit", q.time_limit);
          qFormData.append("type", q.type);

          await axiosInstance.post("/trainer/questions", qFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      toast.success("Quiz created successfully");
      navigate("/quizzes");
    } catch (err: any) {
      console.error("Create quiz failed:", err);
      let msg = "Failed to create quiz. Please try again.";
      if (err.response?.status === 422) {
        msg = err.response.data?.detail?.[0]?.msg || "Invalid input data.";
      } else if (err.response?.status === 401) {
        msg = "Session expired. Please log in again.";
        localStorage.removeItem("access_token");
        localStorage.removeItem("trainer_profile");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        msg = err.response?.data?.detail || err.response?.data?.message || msg;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={() => navigate("/quizzes")}
            className="flex items-center gap-2 px-4 py-3 rounded-[14px] text-[#7c3aed]  hover:bg-[#e9d5ff] hover:text-[#6d28d9] transition-all duration-200 shadow-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />

            <span className="text-[15px] font-semibold">Back to Quizzes</span>
          </Button>

          <div className="mt-[20px]">
            <h1 className="text-[30px] leading-[1.15] font-bold tracking-[-1px] text-[#0f172a]">
              Create Quiz
            </h1>
            <p className="mt-2 text-[15px] leading-[1.5] text-[#64748b]">
              Set up a new quiz that can be shared publicly
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <LuFileQuestion className="w-6 h-6 text-white " />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <p className="text-sm text-gray-500">
                  Quiz title and description
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label>
                  Quiz Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={50}
                  placeholder="e.g., Frontend Developer Assessment"
                  className="mt-2"
                />
              </div>

              {/* Description - Now Optional */}
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.replace(/[0-9]/g, ""))}
                  maxLength={180}
                  rows={4}
                  placeholder="Brief description of what this quiz covers..."
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          {/* Quiz Configuration */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Quiz Configuration</h2>
                <p className="text-sm text-gray-500">
                  Duration, scoring & attempts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timer */}
              <div>
                <Label>
                  Timer (minutes)
                </Label>
                <div className="relative mt-2">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 3) {
                        setDuration(val);
                      }
                    }}
                    min="1"
                    placeholder="e.g. 60"
                    className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Course ID */}
              <div>
                <Label>
                  Course <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="w-full h-10 pl-2 pr-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="" disabled>Select a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Quiz Category - Same width as Duration */}
              <div>
                <Label>Quiz Category</Label>
                <Input
                  type="text"
                  value={quizCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 20) {
                      setQuizCategory(val);
                    }
                  }}
                  maxLength={20}
                  placeholder="e.g. Programming"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quizzes")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !isFormValid}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {submitting && (
                <Loader2 size={18} className="animate-spin mr-2" />
              )}
              Create Quiz
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
