import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Clock,
  Award,
  GripVertical,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Question {
  id?: number;
  _client_id: string; // client-only unique key
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // 'a' | 'b' | 'c' | 'd'
  difficulty?: string;
  type?: string;
  points?: number;
}

export default function EditQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Quiz Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [status, setStatus] = useState("Active");
  const [duration, setDuration] = useState("45");
  // const [passingScore, setPassingScore] = useState("70");
  const [courseId, setCourseId] = useState("8");

  // Tags
  const [tags, setTags] = useState<string[]>(["React", "JavaScript", "Frontend", "Beginner"]);
  const [tagInput, setTagInput] = useState("");

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);

  // Page States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Quiz & Questions Details
  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Quiz Info
        const quizzesRes = await axiosInstance.get("/trainer/quizzes");
        const quizzesList = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data?.items || quizzesRes.data?.data || []);
        const foundQuiz = quizzesList.find((q: any) => String(q.id) === String(id));

        if (foundQuiz) {
          setTitle(foundQuiz.title || "");
          setDescription(foundQuiz.description || "");
          setCourseId(foundQuiz.course_id ? String(foundQuiz.course_id) : "8");
          setDuration(foundQuiz.timer ? String(foundQuiz.timer) : foundQuiz.time ? String(foundQuiz.time).replace("m", "") : "45");
          if (foundQuiz.status) {
            setStatus(foundQuiz.status.charAt(0).toUpperCase() + foundQuiz.status.slice(1));
          } else if (foundQuiz.is_active !== undefined) {
            setStatus(foundQuiz.is_active ? "Active" : "Inactive");
          }
          if (foundQuiz.category) {
            setCategory(foundQuiz.category);
          }
        }

        // 2. Fetch Questions
        try {
          const questionsRes = await axiosInstance.get(`/trainer/quiz-view/${id}`);
          const qData = Array.isArray(questionsRes.data) ? questionsRes.data : (questionsRes.data?.items || questionsRes.data?.data || []);
          const formattedQuestions = qData.map((q: any) => ({
            id: q.id,
            _client_id: Math.random().toString(),
            question_text: q.question_text || "",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_option: q.correct_option?.toLowerCase() || "a",
            difficulty: q.difficulty || "Easy",
            type: q.type || "Multiple Choice",
            points: q.points ?? 2
          }));
          setQuestions(formattedQuestions);
        } catch (err) {
          console.error("Failed to load questions, using mock fallback", err);
          // Fallback mockup
          setQuestions([
            { id: 1, _client_id: "q1", question_text: "What is JSX?", option_a: "JavaScript XML", option_b: "Java Syntax Extension", option_c: "JSON XML", option_d: "None of the above", correct_option: "a", difficulty: "Easy", type: "Multiple Choice", points: 2 },
            { id: 2, _client_id: "q2", question_text: "Explain the useState hook", option_a: "Manage state", option_b: "Side effects", option_c: "Context API", option_d: "Ref control", correct_option: "a", difficulty: "Medium", type: "Multiple Choice", points: 3 },
            { id: 3, _client_id: "q3", question_text: "What is the Virtual DOM?", option_a: "Virtual representation of DOM", option_b: "Real DOM", option_c: "Shadow DOM", option_d: "None", correct_option: "a", difficulty: "Easy", type: "Multiple Choice", points: 2 }
          ]);
        }

      } catch (error) {
        toast.error("Failed to fetch quiz details");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Add a new empty question
  const handleAddQuestion = () => {
    const newQ: Question = {
      _client_id: Math.random().toString(),
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "a",
      difficulty: "Easy",
      type: "Multiple Choice",
      points: 2
    };
    setQuestions([...questions, newQ]);
    toast.success("New question template added");
  };

  // Remove a question
  const handleRemoveQuestion = (client_id: string, databaseId?: number) => {
    setQuestions(questions.filter(q => q._client_id !== client_id));
    if (databaseId) {
      setDeletedQuestionIds([...deletedQuestionIds, databaseId]);
    }
  };

  // Update specific question field
  const handleQuestionChange = (client_id: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => {
      if (q._client_id === client_id) {
        const updated = { ...q, [field]: value };
        // If question type is changed to True/False, set standard options
        if (field === "type") {
          if (value === "True/False") {
            updated.option_a = "True";
            updated.option_b = "False";
            updated.option_c = "";
            updated.option_d = "";
            updated.correct_option = "a";
          } else if (value === "Essay") {
            updated.option_a = "";
            updated.option_b = "";
            updated.option_c = "";
            updated.option_d = "";
            updated.correct_option = "a";
          }
        }
        return updated;
      }
      return q;
    }));
  };

  // Tags logic
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Save changes
  const handleSave = async () => {
    if (!title.trim() || !courseId.trim()) {
      toast.error("Quiz Name and Course ID are required.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Update Quiz metadata
      const quizParams = new URLSearchParams();
      quizParams.append("title", title.trim());
      quizParams.append("description", description.trim());
      quizParams.append("course_id", courseId.trim());
      quizParams.append("timer", duration.trim());
      // optional fields
      quizParams.append("category", category.trim());

      await axiosInstance.put(`/subadmin/quizzes/${id}`, quizParams, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // 2. Delete removed questions
      if (deletedQuestionIds.length > 0) {
        await Promise.all(
          deletedQuestionIds.map(qid =>
            axiosInstance.delete(`/trainer/questions/${qid}`).catch(err => {
              console.error(`Failed to delete question ${qid}`, err);
            })
          )
        );
      }

      // 3. Save questions (create new ones, update existing ones)
      await Promise.all(
        questions.map(async (q) => {
          if (q.id) {
            // Update existing question
            const formData = new FormData();
            formData.append("question_text", q.question_text);
            formData.append("option_a", q.option_a);
            formData.append("option_b", q.option_b);
            formData.append("option_c", q.option_c);
            formData.append("option_d", q.option_d);
            formData.append("correct_option", q.correct_option);

            await axiosInstance.put(`/subadmin/questions/${q.id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          } else {
            // Create new question
            const formData = new FormData();
            formData.append("quiz_id", String(id));
            formData.append("question_text", q.question_text);
            formData.append("option_a", q.option_a);
            formData.append("option_b", q.option_b);
            formData.append("option_c", q.option_c);
            formData.append("option_d", q.option_d);
            formData.append("correct_option", q.correct_option);
            formData.append("difficulty", q.difficulty || "Easy");
            formData.append("points", String(q.points || 2));
            formData.append("time_limit", "60");
            formData.append("type", q.type || "Multiple Choice");

            await axiosInstance.post("/trainer/questions", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          }
        })
      );

      toast.success("Quiz and questions saved successfully!");
      navigate(`/quizzes/${id}/view`);
    } catch (err: any) {
      console.error("Save Quiz failed:", err);
      toast.error(err.response?.data?.detail || "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick stats calculations
  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 md:p-3 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-[#F8FAFC] border-b border-slate-200/80 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/quizzes`)}
            className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
              Edit Quiz
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Modify quiz details and questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/quizzes/${id}/view`)}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Award className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="w-full p-4 md:p-6 space-y-6">
        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Details and Questions) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>

              <div className="space-y-4">
                {/* Quiz Name */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Quiz Name</Label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 35))}
                    maxLength={35}
                    placeholder="Enter quiz name"
                    className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
                  />
                </div>

                {/* Category & Status Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Category</Label>
                    <Input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Programming"
                      className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Status</Label>
                    <Input
                      type="text"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="e.g. Active"
                      className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 180))}
                    maxLength={180}
                    placeholder="Enter quiz description"
                    rows={4}
                    className="mt-2 rounded-xl bg-slate-50 border-0 resize-none focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Questions Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Questions ({questions.length})
                </h2>
                <Button
                  onClick={handleAddQuestion}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-10 rounded-xl px-4 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div
                    key={q._client_id}
                    className="p-5 bg-[#F8FAFC]/60 rounded-2xl border border-slate-100/80 flex flex-col gap-4 hover:bg-[#F8FAFC] transition duration-150 relative"
                  >

                    {/* Top Row: Reorder grip, index circle, Question Text input, Delete Button */}
                    <div className="flex items-start gap-3">
                      <div className="text-slate-400 cursor-grab active:cursor-grabbing pt-2 shrink-0">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Input
                          type="text"
                          value={q.question_text}
                          onChange={(e) => handleQuestionChange(q._client_id, "question_text", e.target.value)}
                          placeholder="What is JSX?"
                          className="h-10 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveQuestion(q._client_id, q.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                     {/* Middle Controls Row: Select Type, Select Difficulty, Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.2fr_1fr] gap-3 pl-10 pr-2">
                      <div>
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(q._client_id, "type", e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 focus:outline-none"
                        >
                          <option>Multiple Choice</option>
                          <option>True/False</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={q.difficulty}
                          onChange={(e) => handleQuestionChange(q._client_id, "difficulty", e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 focus:outline-none"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                      <div>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={q.points === 0 ? "" : q.points ?? 2}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                            handleQuestionChange(q._client_id, "points", val ? parseInt(val) : 0);
                          }}
                          placeholder="2"
                          className="h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Bottom Options List (MCQ / True-False) */}
                    {q.type !== "Essay" && (
                      <div className="space-y-2.5 pl-10 pr-2">
                        {["a", "b", "c", "d"].map((optKey) => {
                          const optField = `option_${optKey}` as keyof Question;
                          const isCorrect = q.correct_option === optKey;

                          // Skip C and D options for True/False question type
                          if (q.type === "True/False" && (optKey === "c" || optKey === "d")) {
                            return null;
                          }

                          return (
                            <div key={optKey} className="flex items-center gap-3">
                              {/* Custom circular indicator */}
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(q._client_id, "correct_option", optKey)}
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition shrink-0 ${isCorrect ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                                  }`}
                              >
                                {isCorrect && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </button>

                              <Input
                                type="text"
                                value={(q[optField] as string) || ""}
                                onChange={(e) => handleQuestionChange(q._client_id, optField, e.target.value)}
                                placeholder={`Option ${optKey.toUpperCase()}`}
                                disabled={q.type === "True/False"}
                                className="h-9 rounded-lg border border-slate-200 bg-white text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Settings & Stats) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quiz Settings Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Quiz Settings</h2>

              <div className="space-y-4">
                {/* Duration */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Duration (minutes)
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="45"
                    className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
                  />
                </div>

                {/* Passing Score */}
                {/* <div>
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    Passing Score (%)
                  </Label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    placeholder="70"
                    className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
                    min={1}
                    max={100}
                  />
                </div> */}
              </div>
            </div>

            {/* Tags Card */}
            {/* <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Tags</h2>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-1 rounded-full border border-blue-100/30 text-[12px] flex items-center gap-1 shadow-none"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-800 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag (press Enter)"
                className="h-10 rounded-xl bg-slate-50 border-0 focus:bg-white transition text-sm"
              />
            </div> */}

            {/* Quick Stats Card */}
            <div className="bg-[#F4F7FF] rounded-2xl border border-blue-100/30 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Quick Stats</h2>

              <div className="space-y-3.5 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Questions</span>
                  <span className="text-slate-900 font-bold">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Points</span>
                  <span className="text-slate-900 font-bold">{totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Est. Duration</span>
                  <span className="text-slate-900 font-bold">{duration || 0} min</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
