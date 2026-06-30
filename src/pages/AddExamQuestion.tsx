import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, HelpCircle, FileCode, Check, ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

/* ─── PROPS & TYPES ──────────────────────────────────────────────────────── */

interface NavigationHeaderProps {
  loading: boolean;
  onBack: () => void;
  onSave: (e: React.FormEvent) => void;
}

interface QuestionDetailsCardProps {
  examId: string;
  exams: any[];
  title: string;
  questionText: string;
  onChange: (field: string, value: any) => void;
}

interface AnswerOptionsCardProps {
  solution: string;
  onChange: (field: string, value: any) => void;
}

interface AdditionalSettingsCardProps {
  points: number | string;
  timeLimit: number | string;
  onChange: (field: string, value: any) => void;
}

interface QuestionInfoSidebarProps {
  questionType: string;
  correctOption: string;
  points: number | string;
  timeLimit: number | string;
}

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ loading, onBack, onSave }) => (
  <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-6 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 space-y-4">
    <Button
      onClick={onBack}
      variant="ghost"
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#7c3aed] bg-[#f3e8ff] hover:bg-[#e9d5ff] hover:text-[#6d28d9] transition-all duration-200 shadow-none font-semibold text-[15px]"
    >
      <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
      <span>Back to Exam</span>
    </Button>

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-[#1e293b] tracking-tight leading-tight">
          Add Question
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new question for guest quizzes
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 bg-white border border-gray-200 font-semibold px-6 py-2.5 rounded-xl transition-all"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" strokeWidth={2} />
          )}
          Save Question
        </Button>
      </div>
    </div>
  </div>
);

const QuestionDetailsCard: React.FC<QuestionDetailsCardProps> = ({
  examId,
  exams,
  title,
  questionText,
  onChange,
}) => (
  <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <FileCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Question Details</h3>
          <p className="text-[13px] text-gray-500 font-medium">Question text and type</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Select Exam <span className="text-red-500">*</span></Label>
          <select
            value={examId}
            onChange={(e) => onChange('exam_id', e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-[14px]"
            required
          >
            <option value="">Select an Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-[14px] font-semibold text-gray-800">Question <span className="text-red-500">*</span></Label>
          </div>
          <Input
            value={title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g., Prime Number Checker"
            className="h-11 rounded-xl bg-gray-50 border-gray-200 text-[14px]"
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Description <span className="text-red-500">*</span></Label>
          <textarea
            value={questionText}
            onChange={(e) => onChange('question_text', e.target.value)}
            placeholder="Enter your question here..."
            className="w-full h-32 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-[14px] resize-none"
            required
            // maxLength={5000}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AnswerOptionsCard: React.FC<AnswerOptionsCardProps> = ({ solution, onChange }) => (
  <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Answer Options</h3>
          <p className="text-[13px] text-gray-500 font-medium">Essay response</p>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <Label className="text-[14px] font-semibold text-gray-800">Expected Answer / Rubric <span className="text-red-500">*</span></Label>
        <textarea
          maxLength={300}
          value={solution}
          onChange={(e) => onChange('solution', e.target.value)}
          placeholder="Provide a model answer or grading rubric for this essay question..."
          className="w-full h-32 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-[14px] resize-none"
        />
        <p className="text-[12px] text-gray-500 font-medium mt-2 text-right">
          Students will write a text response. No multiple choice options are required.
        </p>
      </div>
    </CardContent>
  </Card>
);

const AdditionalSettingsCard: React.FC<AdditionalSettingsCardProps> = ({ points, timeLimit, onChange }) => (
  <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-5">Additional Settings</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Points <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={points || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              onChange('points', val ? parseInt(val, 10) : '');
            }}
            placeholder="e.g., 10"
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Time Limit (minutes) <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={timeLimit || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              onChange('time_limit', val ? parseInt(val, 10) : '');
            }}
            placeholder="e.g., 5"
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuestionInfoSidebar: React.FC<QuestionInfoSidebarProps> = ({
  questionType,
  correctOption,
  points,
  timeLimit,
}) => (
  <Card className="bg-[#f8fafc] border border-indigo-50 shadow-sm rounded-2xl sticky top-6">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-sm">
          <HelpCircle className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Question Info</h3>
      </div>
      <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {questionType !== 'Essay' && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-[14px] text-gray-500 font-medium">Options</span>
              <span className="text-[15px] font-bold text-gray-900">
                {questionType === 'True/False' ? '2' : '4'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-[14px] text-gray-500 font-medium">Correct Answer</span>
              <span className="text-[15px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">Option {correctOption.toUpperCase()}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-[14px] text-gray-500 font-medium">Points</span>
          <span className="text-[15px] font-bold text-gray-900">{points}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-[14px] text-gray-500 font-medium">Time Limit</span>
          <span className="text-[15px] font-bold text-gray-900">{timeLimit ? `${timeLimit}m` : ''}</span>
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Tips:</h4>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2 text-[13px] text-gray-600 font-medium">
            <Check className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
            Keep questions clear and concise
          </li>
          <li className="flex items-start gap-2 text-[13px] text-gray-600 font-medium">
            <Check className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
            Ensure only one correct answer
          </li>
          <li className="flex items-start gap-2 text-[13px] text-gray-600 font-medium">
            <Check className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
            Avoid ambiguous wording
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */

export default function AddExamQuestion() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<any[]>([]);

  const [questionForm, setQuestionForm] = useState({
    title: '',
    exam_id: '',
    question_text: '',
    question_type: 'Essay',
    category: '',
    difficulty: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a' as 'a' | 'b' | 'c' | 'd',
    solution: '',
    points: '' as number | string,
    time_limit: '' as number | string,
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/exam/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setExams(data);
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, [token]);

  const handleQuestionFormChange = (field: string, value: any) => {
    setQuestionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionForm.exam_id) {
      toast.error('Please select an exam');
      return;
    }

    if (!questionForm.title.trim()) {
      toast.error('Please enter a question title');
      return;
    }

    if (questionForm.title.trim().length > 24) {
      toast.error('Question title cannot exceed 24 characters');
      return;
    }

    if (!questionForm.question_text.trim()) {
      toast.error('Please enter question text');
      return;
    }

    if (!questionForm.solution.trim()) {
      toast.error('Please enter expected answer / rubric');
      return;
    }

    if (!questionForm.points) {
      toast.error('Please enter points');
      return;
    }

    if (!questionForm.time_limit) {
      toast.error('Please enter time limit');
      return;
    }

    setLoading(true);

    try {
      let formattedQuestion = questionForm.question_text.trim();
      if (questionForm.question_type === 'Multiple Choice') {
        formattedQuestion += `\n\nOptions:\nA) ${questionForm.option_a || ''}\nB) ${questionForm.option_b || ''}\nC) ${questionForm.option_c || ''}\nD) ${questionForm.option_d || ''}\n\nCorrect Option: ${questionForm.correct_option.toUpperCase()}`;
      } else if (questionForm.question_type === 'True/False') {
        formattedQuestion += `\n\nOptions:\nA) True\nB) False\n\nCorrect Option: ${questionForm.correct_option === 'a' ? 'True' : 'False'}`;
      }

      const payload = {
        title: questionForm.title.trim() || questionForm.question_text.slice(0, 50).trim() || 'Untitled Question',
        question: formattedQuestion,
        description: questionForm.solution.trim() || '',
        sample_inputs: '',
        sample_outputs: '',
        test_cases: [],
        suggestion: [],

        exam_id: questionForm.exam_id,
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        category: questionForm.category,
        difficulty: questionForm.difficulty,
        option_a: questionForm.option_a,
        option_b: questionForm.option_b,
        option_c: questionForm.option_c,
        option_d: questionForm.option_d,
        correct_option: questionForm.correct_option,
        solution: questionForm.solution,
        points: questionForm.points,
        time_limit: questionForm.time_limit,
      };

      const res = await fetch(`${API_BASE_URL}/compiler-questions/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to create question';
        try {
          const errData = await res.json();
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              errorMsg = errData.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ');
            } else if (typeof errData.detail === 'string') {
              errorMsg = errData.detail;
            } else {
              errorMsg = JSON.stringify(errData.detail);
            }
          } else if (errData.message) {
            errorMsg = errData.message;
          }
        } catch { }
        throw new Error(errorMsg);
      }

      toast.success('Question added to bank successfully');
      navigate('/exam-management');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full space-y-6">
      <NavigationHeader
        loading={loading}
        onBack={() => navigate('/exam-management')}
        onSave={handleCreateQuestion}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuestionDetailsCard
            examId={questionForm.exam_id}
            exams={exams}
            title={questionForm.title}
            questionText={questionForm.question_text}
            onChange={handleQuestionFormChange}
          />

          <AnswerOptionsCard
            solution={questionForm.solution}
            onChange={handleQuestionFormChange}
          />

          <AdditionalSettingsCard
            points={questionForm.points}
            timeLimit={questionForm.time_limit}
            onChange={handleQuestionFormChange}
          />
        </div>

        <div className="space-y-6">
          <QuestionInfoSidebar
            questionType={questionForm.question_type}
            correctOption={questionForm.correct_option}
            points={questionForm.points}
            timeLimit={questionForm.time_limit}
          />
        </div>
      </div>
    </div>
  );
}
