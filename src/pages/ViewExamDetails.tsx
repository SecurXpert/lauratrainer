import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock, BookOpen, Users } from 'lucide-react';
import { LuSparkles } from 'react-icons/lu';
import { API_BASE_URL } from "./services/api/api";

export default function ViewExamDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseExam = location.state?.exam;

  const [examDetails, setExamDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!baseExam?.id) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE_URL}/exam/get/details?exam_id=${baseExam.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch exam details");
        const data = await res.json();
        setExamDetails(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [baseExam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  const exam = examDetails || baseExam;

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Exam not found</p>
          <button
            type="button"
            onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })}
            className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Back to Exam Management
          </button>
        </div>
      </div>
    );
  }

  // Derive display values
  const status = exam.is_active !== undefined ? (exam.is_active ? 'Active' : 'Completed') : (exam.status || (exam.window_end && new Date(exam.window_end) > new Date() ? 'Active' : 'Completed'));
  const questionsCount = exam.questions ? Object.keys(exam.questions).length : (exam.questions_count || 5);
  const date = exam.date || (exam.window_start ? new Date(exam.window_start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'May 20, 2026');
  const participants = exam.participants || 45;

  // Extract questions from details or use mock if missing
  let questionsList: any[] = [];
  if (examDetails?.questions) {
    questionsList = Object.entries(examDetails.questions).map(([key, q]: [string, any]) => ({
      id: q.question_bank_id || key,
      title: q.details?.title || `Question ${key}`,
      category: q.details?.category || examDetails.category || 'Programming Challenge',
      difficulty: q.details?.difficulty || 'Medium',
      pts: q.score || 10,
    }));
  } else {
    questionsList = exam.questionsList || [
      { id: 1, title: 'Two Sum', category: 'Programming Challenge', difficulty: 'Easy', pts: 10 },
      { id: 2, title: 'Binary Search Tree', category: 'Programming Challenge', difficulty: 'Medium', pts: 20 },
      { id: 3, title: 'Dynamic Programming', category: 'Programming Challenge', difficulty: 'Medium', pts: 20 },
      { id: 4, title: 'Graph Traversal', category: 'Programming Challenge', difficulty: 'Hard', pts: 30 },
      { id: 5, title: 'Merge Sort', category: 'Programming Challenge', difficulty: 'Medium', pts: 20 },
    ];
  }

  const totalPoints = questionsList.reduce((sum: number, q: any) => sum + q.pts, 0);

  const difficultyColor = (d: string) => {
    if (d === 'Easy') return 'bg-[#dcfce7] text-[#16a34a]';
    if (d === 'Hard') return 'bg-[#fee2e2] text-[#dc2626]';
    return 'bg-[#fef3c7] text-[#d97706]';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-3 font-sans">
      <div className="w-full">

        {/* Page Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-300/60">
            <LuSparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-[30px] leading-none font-bold text-[#111827]">Exam Management</h1>
            <p className="text-[15px] text-slate-500 mt-2">Manage coding questions and create exams</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm mb-8">
          <button
            type="button"
            onClick={() => navigate('/exam-management', { state: { activeTab: 'questions' } })}
            className="px-8 py-3 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Question Bank
          </button>
          <button
            type="button"
            onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })}
            className="px-8 py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-400/40 transition-all hover:shadow-purple-400/60"
          >
            Exams
          </button>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-[22px] shadow-xl shadow-slate-200/70 overflow-hidden">

          {/* Purple Header */}
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-8 py-6 flex items-center gap-4 text-white">
            <button
              type="button"
              onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-[24px] font-bold leading-tight">{exam.title}</h2>
              <p className="text-sm text-white/80 mt-1">Exam Details</p>
            </div>
          </div>

          <div className="px-8 py-8">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Date */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Date</p>
                <p className="text-sm font-bold text-[#111827]">{date}</p>
              </div>

              {/* Duration */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Duration</p>
                <p className="text-sm font-bold text-[#111827]">{exam.duration} minutes</p>
              </div>

              {/* Questions */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Questions</p>
                <p className="text-sm font-bold text-[#111827]">{questionsCount}</p>
              </div>

              {/* Participants */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Participants</p>
                <p className="text-sm font-bold text-[#111827]">{participants}</p>
              </div>
            </div>

            {/* Exam Overview */}
            <div className="mb-8">
              <h3 className="text-[16px] font-bold text-[#111827] mb-4">Exam Overview</h3>
              <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6 text-[14px] text-slate-600 leading-7">
                {exam.description ||
                  'This mid-term assessment evaluates students\' understanding of fundamental programming concepts, data structures, and algorithm design. Students are expected to solve problems efficiently while demonstrating clean code practices and proper problem-solving approaches.'}
              </div>
            </div>

            {/* Questions List */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-[#111827]">Questions</h3>
                <span className="text-sm text-slate-500 font-medium">Total Points: {totalPoints}</span>
              </div>
              <div className="space-y-3">
                {questionsList.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="flex items-center gap-4 bg-[#f8fafc] border border-slate-100 rounded-2xl px-5 py-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-[#111827]">{q.title}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{q.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${difficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-[13px] font-bold text-slate-600 ml-2 w-14 text-right">{q.pts} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-4">Instructions</h3>
              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-6">
                <ol className="space-y-3">
                  {[
                    'Read all questions carefully before starting.',
                    `You have ${exam.duration} minutes to complete all questions.`,
                    'All test cases must pass for full credit.',
                    'Code quality and efficiency will be evaluated.',
                  ].map((instr, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#fde68a] text-[#b45309] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-[14px] text-slate-700">{instr}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
