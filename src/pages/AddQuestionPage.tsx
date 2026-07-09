import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { NavigationHeader } from "@/components/AddQuestionPage/NavigationHeader";
import { QuestionDetailsCard } from "@/components/AddQuestionPage/QuestionDetailsCard";
import { AnswerOptionsCard } from "@/components/AddQuestionPage/AnswerOptionsCard";
import { QuestionInfoSidebar } from "@/components/AddQuestionPage/QuestionInfoSidebar";
import { Quiz } from "@/components/AddQuestionPage/Types";

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

  const optionsArr = [
    { key: "a", label: "A", val: optionA, setVal: setOptionA },
    { key: "b", label: "B", val: optionB, setVal: setOptionB },
    { key: "c", label: "C", val: optionC, setVal: setOptionC },
    { key: "d", label: "D", val: optionD, setVal: setOptionD },
    { key: "e", label: "E", val: optionE, setVal: setOptionE },
    { key: "f", label: "F", val: optionF, setVal: setOptionF },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-3">
      <div className="w-full space-y-6">

        <NavigationHeader
          addingQuestion={addingQuestion}
          onCancel={handleCancel}
          onSave={handleSaveQuestion}
        />

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Details and Options) */}
          <div className="lg:col-span-8 space-y-6">
            <QuestionDetailsCard
              quizzes={quizzes}
              selectedQuizId={selectedQuizId}
              setSelectedQuizId={setSelectedQuizId}
              questionText={questionText}
              setQuestionText={setQuestionText}
              activeOptions={activeOptions}
              options={optionsArr}
              correctOption={correctOption}
              onCorrectOptionTextChange={handleCorrectOptionTextChange}
            />

            <AnswerOptionsCard
              activeOptions={activeOptions}
              options={optionsArr}
              correctOption={correctOption}
              setCorrectOption={setCorrectOption}
              addOption={addOption}
              deleteOption={deleteOption}
            />
          </div>

          {/* Right Column (Question Info & Tips) */}
          <div className="lg:col-span-4 space-y-6">
            <QuestionInfoSidebar
              activeOptionsLength={activeOptions.length}
              correctOption={correctOption}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
