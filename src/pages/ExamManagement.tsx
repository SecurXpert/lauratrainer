import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Search, Clock, Calendar, FileText, CheckCircle, XCircle, Eye, FileCode, Check, Lightbulb, ChevronLeft, LayoutDashboard, Settings, Sparkles, BookOpen, Code, ClipboardList, X, List } from 'lucide-react';
import { toast } from 'sonner';
import { LuSparkles } from "react-icons/lu";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

interface TestCase {
  testcase: number;
  input: string;
  output: string;
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

interface ExamQuestion {
  question_bank_id: number;
  score: number;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  course_id: number;
  window_start: string;
  window_end: string;
  duration: number;
  category: string;
  questions: Record<string, ExamQuestion>;
}

export default function ExamManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabFromSearch = searchParams.get('tab') as 'questions' | 'exams' | null;
  const initialTab = location.state?.activeTab || tabFromSearch || 'questions';
  const [activeTab, setActiveTab] = useState<'questions' | 'exams'>(initialTab);
  const [questionView, setQuestionView] = useState<'list' | 'details'>('list');
  const [selectedBankQuestion, setSelectedBankQuestion] = useState<QuestionBankItem | null>(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Question state
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [questionBank.length]);

  const toggleDescription = (id: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const [questionForm, setQuestionForm] = useState({
    title: '',
    question: '',
    description: '',
    sample_inputs: '',
    sample_outputs: '',
    test_cases: [{ testcase: 0, input: '', output: '' }] as TestCase[],
    suggestion: [''],
  });

  // Exam state
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    course_id: '',
    window_start: '',
    window_end: '',
    duration: '',
    category: '',
    questions: {} as Record<string, ExamQuestion>,
  });

  const token = localStorage.getItem('access_token');

  /* ================= FETCH QUESTION BANK ================= */

  const fetchQuestionBank = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/compiler-questions/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch question bank');
      const data = await res.json();
      setQuestionBank(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load question bank');
    }
  };

  /* ================= FETCH EXAMS ================= */

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/exam/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      setExams(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exams');
    }
  };

  const handleDeleteExam = async (id: number) => {
    // Optimistically update the UI to instantly remove the exam row
    const previousExams = [...exams];
    setExams(exams.filter((e) => e.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/exam/delete?exam_id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to delete exam');

      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (err: any) {
      // Revert if API fails
      setExams(previousExams);
      toast.error(err.message || 'Failed to delete exam');
    }
  };

  /* ================= FETCH EXAM DETAILS ================= */

  const fetchExamDetails = async (examId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/exam/get/details?exam_id=${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch exam details');
      const data = await res.json();
      setSelectedExam(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exam details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionBank();
    fetchExams();
  }, []);

  /* ================= QUESTION FORM HANDLERS ================= */

  const handleQuestionFormChange = (field: string, value: any) => {
    setQuestionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    const newTestCases = [...questionForm.test_cases];
    newTestCases[index][field] = value;
    setQuestionForm((prev) => ({ ...prev, test_cases: newTestCases }));
  };

  const addTestCase = () => {
    setQuestionForm((prev) => ({
      ...prev,
      test_cases: [
        ...prev.test_cases,
        { testcase: prev.test_cases.length, input: '', output: '' },
      ],
    }));
  };

  const removeTestCase = (index: number) => {
    const newTestCases = questionForm.test_cases.filter((_, i) => i !== index);
    setQuestionForm((prev) => ({ ...prev, test_cases: newTestCases }));
  };

  const handleSuggestionChange = (index: number, value: string) => {
    const newSuggestions = [...questionForm.suggestion];
    newSuggestions[index] = value;
    setQuestionForm((prev) => ({ ...prev, suggestion: newSuggestions }));
  };

  const addSuggestion = () => {
    setQuestionForm((prev) => ({ ...prev, suggestion: [...prev.suggestion, ''] }));
  };

  const removeSuggestion = (index: number) => {
    const newSuggestions = questionForm.suggestion.filter((_, i) => i !== index);
    setQuestionForm((prev) => ({ ...prev, suggestion: newSuggestions }));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/compiler-questions/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionForm),
      });

      if (!res.ok) throw new Error('Failed to create question');

      toast.success('Question added to bank successfully');
      setQuestionForm({
        title: '',
        question: '',
        description: '',
        sample_inputs: '',
        sample_outputs: '',
        test_cases: [{ testcase: 0, input: '', output: '' }],
        suggestion: [''],
      });
      setQuestionView('list');
      fetchQuestionBank();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    // Optimistically update the UI to instantly remove the row
    const previousBank = [...questionBank];
    setQuestionBank(questionBank.filter((q) => (q.question_id || q.id) !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/compiler-questions/delete?question_id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to delete question');

      toast.success('Question deleted successfully', { duration: 3000 });
      fetchQuestionBank();
    } catch (err: any) {
      // Revert UI if the API call fails
      setQuestionBank(previousBank);
      toast.error(err.message || 'Failed to delete question', { duration: 3000 });
    }
  };

  /* ================= EXAM FORM HANDLERS ================= */

  const handleExamFormChange = (field: string, value: any) => {
    setExamForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleQuestionSelection = (questionId: number, score: number = 10) => {
    const questionKey = Object.keys(examForm.questions).find(
      (key) => examForm.questions[key].question_bank_id === questionId
    );

    if (questionKey) {
      const newQuestions = { ...examForm.questions };
      delete newQuestions[questionKey];
      setExamForm((prev) => ({ ...prev, questions: newQuestions }));
    } else {
      const newKey = String(Object.keys(examForm.questions).length + 1);
      setExamForm((prev) => ({
        ...prev,
        questions: { ...prev.questions, [newKey]: { question_bank_id: questionId, score } },
      }));
    }
  };

  const updateQuestionScore = (questionKey: string, score: number) => {
    setExamForm((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questionKey]: { ...prev.questions[questionKey], score },
      },
    }));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: examForm.title.trim(),
        description: examForm.description.trim(),
        course_id: Number(examForm.course_id) || 1,
        collage: String(examForm.course_id).trim().toUpperCase() || 'CS101',
        window_start: examForm.window_start,
        window_end: examForm.window_end,
        duration: Number(examForm.duration),
        category: examForm.category.trim() || 'General',
        questions: examForm.questions,
      };

      const res = await fetch(`${API_BASE_URL}/exam/creation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create exam');

      toast.success('Exam created successfully');
      setExamForm({
        title: '',
        description: '',
        course_id: '',
        window_start: '',
        window_end: '',
        duration: '',
        category: '',
        questions: {},
      });
      setShowExamForm(false);
      fetchExams();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-4 sm:p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex shrink-0 items-center justify-center shadow-lg shadow-purple-300">
          <LuSparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-[24px] sm:text-[30px] font-semibold text-gray-900" style={{ fontWeight: "700" }}>Exam Management</h1>
          <p className="text-[14px] sm:text-[16px] text-gray-500 font-normal">Manage coding questions and create exams</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex w-full sm:w-fit gap-1 sm:gap-2 bg-white rounded-xl p-1.5 shadow-sm mb-6 sm:mb-8 border border-gray-100">
        <Button
          variant="ghost"
          onClick={() => { setActiveTab('questions'); setQuestionView('list'); }}
          className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-lg text-[13px] sm:text-[15px] font-semibold transition-all duration-300 focus:ring-0 focus-visible:ring-0 ${activeTab === 'questions'
            ? 'text-white hover:text-white bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-[0_12px_25px_rgba(124,58,237,0.4)] hover:shadow-[0_14px_30px_rgba(124,58,237,0.5)]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-none'
            }`}
        >
          Question Bank
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('exams')}
          className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-lg text-[13px] sm:text-[15px] font-semibold transition-all duration-300 focus:ring-0 focus-visible:ring-0 ${activeTab === 'exams'
            ? 'text-white hover:text-white bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-[0_12px_25px_rgba(124,58,237,0.4)] hover:shadow-[0_14px_30px_rgba(124,58,237,0.5)]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-none'
            }`}
        >
          Exams
        </Button>
      </div>

      {/* QUESTIONS TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-8">
          {questionView === 'list' && (
            <>
              {/* Question Bank Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#2B7FFF] to-[#00B8DB] flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <FileCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <p className="text-2xl sm:text-[32px] font-bold text-gray-900 leading-none mb-1 sm:mb-2">{questionBank.length}</p>
                    <p className="text-xs sm:text-[14px] text-gray-400 font-medium">Total Questions</p>
                  </CardContent>
                </Card>

              </div>

              {/* Question Bank List */}
              <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-100 gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">Question Bank</h2>
                    <p className="text-[13px] sm:text-[15px] text-gray-500 font-base mt-1">Manage all coding questions</p>
                  </div>
                  <Button
                    onClick={() => navigate('/exam-management/add-question')}
                    style={{ background: 'linear-gradient(90deg, #9810FA 0%, #4F39F6 100%)' }}
                    className="w-full sm:w-auto text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-300 hover:brightness-110 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-1.5" />
                    Add Question
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto custom-scrollbar pb-3">
                    <table className="table-fixed w-full border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-left w-[80px]">ID</th>
                          <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-left w-[250px]">Question Title</th>
                          {/* <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-[120px]">Test Cases</th> */}
                          <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-left w-[150px]">Description</th>
                          <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-[140px]">Last Modified</th>
                          <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-auto">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const reversedQuestions = [...questionBank].reverse();
                          const totalPages = Math.ceil(reversedQuestions.length / itemsPerPage);
                          const startIndex = (currentPage - 1) * itemsPerPage;
                          const currentQuestions = reversedQuestions.slice(startIndex, startIndex + itemsPerPage);

                          return (
                            <>
                              {currentQuestions.map((q, i) => {
                                const hasTests = q.test_cases?.length > 0;
                                const hasSuggestions = q.suggestion?.length > 0 && q.suggestion[0] !== '';

                                const lastModified = (q as any).created_at
                                  ? new Date((q as any).created_at).toLocaleDateString('en-CA')
                                  : new Date().toLocaleDateString('en-CA');

                                const qId = q.question_id || q.id;
                                const displayId = startIndex + i + 1;

                                return (
                                  <tr key={qId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5 px-6 text-[14px] font-semibold text-gray-900 text-left">{displayId}</td>
                                    <td className="py-5 px-6 text-[15px] font-semibold text-[#101828] text-left truncate">{q.title}</td>
                                    <td className="py-5 px-6 text-[14.5px] text-gray-600 font-normal text-left max-w-[250px]">
                                      <div className="h-[40px] overflow-hidden whitespace-normal break-words leading-[20px]">
                                        {q.question || q.description || 'No description provided.'}
                                      </div>
                                    </td>
                                    <td className="py-5 px-6 text-[14px] text-gray-500 font-normal text-center">
                                      {lastModified}
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                      <div className="flex items-center justify-center gap-4 whitespace-nowrap">
                                        <button
                                          onClick={() => navigate('/exam-management/view-question', { state: { question: q, questionId: qId } })}
                                          className="flex items-center text-[#7c3aed] hover:text-[#6d28d9] font-semibold text-[14.5px] transition-colors"
                                        >
                                          <Eye className="w-4 h-4" strokeWidth={2} />

                                        </button>
                                        <button
                                          onClick={() => handleDeleteQuestion(qId)}
                                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all flex items-center justify-center"
                                          title="Delete Question"
                                        >
                                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {(() => {
                    const totalPages = Math.ceil(questionBank.length / itemsPerPage);
                    if (totalPages <= 1) return null;

                    return (
                      <div className="flex justify-center items-center gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-9 h-9 rounded-xl text-[14px] font-bold transition-all ${currentPage === i + 1
                                ? "bg-[#5850EC] text-white shadow-sm"
                                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                                }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
                        >
                          Next
                        </button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </>
          )}

          {questionView === 'details' && selectedBankQuestion && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Top Header Card */}
              <div className="bg-[#6366f1] rounded-[24px] p-8 flex flex-col relative text-white shadow-sm">
                <button
                  onClick={() => setQuestionView('list')}
                  className="absolute top-8 left-8 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="ml-16">
                  <h2 className="text-[28px] font-bold tracking-tight">{selectedBankQuestion.title}</h2>
                  <p className="text-[14px] text-indigo-100 font-medium mt-1">Question Details</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 px-2">
                <span className="px-4 py-1.5 bg-[#dcfce7] text-[#166534] rounded-full text-[13px] font-bold">Easy</span>
                <span className="px-4 py-1.5 bg-[#e0e7ff] text-[#3730a3] rounded-full text-[13px] font-bold">Arrays</span>
              </div>

              {/* Problem Statement */}
              <div className="px-2">
                <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4">
                  <Code className="w-5 h-5 mr-2 text-[#9333ea]" />
                  Problem Statement
                </h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-6 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedBankQuestion.question || "No problem statement provided."}
                </div>
              </div>

              {/* Test Cases */}
              {selectedBankQuestion.test_cases?.length > 0 && (
                <div className="px-2">
                  <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4 mt-8">
                    <ClipboardList className="w-5 h-5 mr-2 text-[#16a34a]" />
                    Test Cases
                  </h3>
                  <div className="space-y-4">
                    {selectedBankQuestion.test_cases.map((tc, idx) => (
                      <div key={idx} className="bg-[#f0fdf4] border border-[#dcfce7] rounded-[20px] p-6">
                        <p className="text-[13px] font-bold text-gray-800 mb-4">Test Case {idx + 1}</p>
                        <div className="space-y-3">
                          <div className="bg-white border border-[#dcfce7] rounded-xl p-4 text-[14px] font-mono text-gray-800 shadow-sm">
                            <span className="text-gray-400 text-[12px] block mb-1.5 font-sans font-medium">Input:</span>
                            {tc.input}
                          </div>
                          <div className="bg-white border border-[#dcfce7] rounded-xl p-4 text-[14px] font-mono text-gray-800 shadow-sm">
                            <span className="text-gray-400 text-[12px] block mb-1.5 font-sans font-medium">Output:</span>
                            {tc.output}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {selectedBankQuestion.suggestion?.length > 0 && selectedBankQuestion.suggestion[0] !== '' && (
                <div className="px-2">
                  <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4 mt-8">
                    <Lightbulb className="w-5 h-5 mr-2 text-[#f59e0b]" />
                    Suggestions
                  </h3>
                  <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-[20px] p-6">
                    <div className="space-y-4">
                      {selectedBankQuestion.suggestion.map((sug, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-[#fed7aa] text-[#c2410c] flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-[14px] text-gray-700 leading-relaxed font-medium">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Constraints (Static block matching mockup) */}
              <div className="px-2 mb-8">
                <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4 mt-8">
                  <List className="w-5 h-5 mr-2 text-gray-700" />
                  Constraints
                </h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
                      <code className="text-[13px] text-[#9333ea] bg-purple-50 px-2 py-1 rounded-md font-mono">2 &lt;= nums.length &lt;= 10^4</code>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
                      <code className="text-[13px] text-[#9333ea] bg-purple-50 px-2 py-1 rounded-md font-mono">-10^9 &lt;= nums[i] &lt;= 10^9</code>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
                      <code className="text-[13px] text-[#9333ea] bg-purple-50 px-2 py-1 rounded-md font-mono">-10^9 &lt;= target &lt;= 10^9</code>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
                      <span className="text-[14px] text-gray-700 font-medium">Only one valid answer exists.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Exam Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#a855f7] flex items-center justify-center mb-3 sm:mb-6 shadow-sm">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-[36px] font-bold text-gray-900 leading-none mb-1 sm:mb-2">{exams.length || 4}</p>
                <p className="text-xs sm:text-[14px] text-gray-500 font-base">Total Exams</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#f43f5e] flex items-center justify-center mb-3 sm:mb-6 shadow-sm">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-[36px] font-bold text-gray-900 leading-none mb-1 sm:mb-2">
                  {exams.filter((e) => new Date(e.window_end) > new Date()).length || 2}
                </p>
                <p className="text-xs sm:text-[14px] text-gray-500 font-base">Active Exams</p>
              </CardContent>
            </Card>

          </div>



          {/* Exam List */}
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-100 gap-4">
              <div>
                <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Exams</h2>
                <p className="text-[13px] text-slate-400 font-medium mt-0.5">Manage all exams and assessments</p>
              </div>
              <Button
                onClick={() => navigate('/exam-management/new')}
                style={{ background: 'linear-gradient(90deg, #9810FA 0%, #4F39F6 100%)' }}
                className="w-full sm:w-auto text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Exam
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse min-w-[820px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#EEF2F7]">
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[60px]">#</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Exam Title</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[150px]">Duration</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[120px]">Status</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[140px]">Date</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(exams.length > 0 ? exams : [
                      { id: 34565, title: 'Mid-Term Programming Assessment', duration: 120, status: 'Active', questions_count: 5, date: '2026-05-20' },
                      { id: 34566, title: 'Data Structures Final Exam', duration: 180, status: 'Scheduled', questions_count: 8, date: '2026-06-15' },
                      { id: 34567, title: 'Algorithm Design Quiz', duration: 60, status: 'Active', questions_count: 3, date: '2026-05-18' },
                      { id: 34568, title: 'Web Development Challenge', duration: 90, status: 'Completed', questions_count: 4, date: '2026-05-10' }
                    ])].reverse().map((exam: any, i) => {
                      const status = exam.status || (new Date(exam.window_end) > new Date() ? 'Active' : 'Completed');
                      const statusConfig =
                        status === 'Active'
                          ? { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' }
                          : status === 'Scheduled'
                          ? { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
                          : { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
                      const displayId = i + 1;

                      return (
                        <tr
                          key={exam.id || i}
                          className="border-b border-[#F1F4F8] hover:bg-[#FAFBFC] transition-colors group"
                        >
                          {/* ID */}
                          <td className="py-4 px-6 text-[13px] font-bold text-slate-400 text-left">
                            {String(displayId).padStart(2, '0')}
                          </td>

                          {/* Title */}
                          <td className="py-4 px-6 text-left max-w-[260px]">
                            <span className="text-[14.5px] font-semibold text-[#101828] truncate block leading-snug">
                              {exam.title}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-4 px-6 text-left">
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[13px] font-medium text-slate-600 whitespace-nowrap">{exam.duration} min</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConfig.dot}`} />
                              {status}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 text-left">
                            <span className="text-[13px] text-slate-500 font-medium">
                              {exam.date || (exam.window_start ? new Date(exam.window_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A')}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate('/exam-management/view-exam', { state: { exam } })}
                                title="View Exam"
                                className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700 transition-all"
                              >
                                <Eye className="w-4 h-4" strokeWidth={2.2} />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                title="Delete Exam"
                                className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Exam Details Modal */}
          {selectedExam && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedExam.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{selectedExam.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedExam(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Course ID</p>
                    <p className="font-medium">{selectedExam.course_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedExam.duration} min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-medium">{selectedExam.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Window Start</p>
                    <p className="font-medium">{new Date(selectedExam.window_start).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Window End</p>
                    <p className="font-medium">{new Date(selectedExam.window_end).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Questions</p>
                  <div className="border rounded-lg p-4 space-y-2">
                    {Object.entries(selectedExam.questions || {}).map(([key, q]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          Q{key}: Bank ID {q.question_bank_id}
                        </span>
                        <span className="text-sm font-medium text-blue-600">{q.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

