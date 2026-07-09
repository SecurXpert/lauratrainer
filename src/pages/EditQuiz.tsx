import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Question } from "../components/EditQuiz/EditQuizTypes";
import EditQuizHeader from "../components/EditQuiz/EditQuizHeader";
import EditQuizBasicInfo from "../components/EditQuiz/EditQuizBasicInfo";
import EditQuizQuestions from "../components/EditQuiz/EditQuizQuestions";
import EditQuizSettings from "../components/EditQuiz/EditQuizSettings";
import EditQuizStats from "../components/EditQuiz/EditQuizStats";

export default function EditQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Quiz Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [status, setStatus] = useState("Active");
  const [duration, setDuration] = useState("45");
  const [courseId, setCourseId] = useState("8");

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
          const savedDesc = localStorage.getItem(`quiz_desc_${id}`);
          setDescription(foundQuiz.description || savedDesc || "");
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

      await axiosInstance.put(`/subadmin/quizzes/${id}`, quizParams, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (description.trim()) {
        localStorage.setItem(`quiz_desc_${id}`, description.trim());
      } else {
        localStorage.removeItem(`quiz_desc_${id}`);
      }

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

            // Let Axios set the boundary string automatically for FormData
            await axiosInstance.put(`/subadmin/questions/${q.id}`, formData);
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

            // Let Axios set the boundary string automatically for FormData
            await axiosInstance.post("/trainer/questions", formData);
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
      <EditQuizHeader 
        id={id} 
        submitting={submitting} 
        handleSave={handleSave} 
      />

      <div className="w-full p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <EditQuizBasicInfo 
              title={title}
              setTitle={setTitle}
              category={category}
              setCategory={setCategory}
              status={status}
              setStatus={setStatus}
              description={description}
              setDescription={setDescription}
            />

            <EditQuizQuestions 
              questions={questions}
              handleAddQuestion={handleAddQuestion}
              handleRemoveQuestion={handleRemoveQuestion}
              handleQuestionChange={handleQuestionChange}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <EditQuizSettings 
              duration={duration}
              setDuration={setDuration}
            />

            <EditQuizStats 
              questionsCount={questions.length}
              totalPoints={totalPoints}
              duration={duration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
