import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from "./services/api/api";

import { NavigationHeader } from '@/components/AddExamQuestion/NavigationHeader';
import { QuestionDetailsCard } from '@/components/AddExamQuestion/QuestionDetailsCard';
import { AnswerOptionsCard } from '@/components/AddExamQuestion/AnswerOptionsCard';
import { AdditionalSettingsCard } from '@/components/AddExamQuestion/AdditionalSettingsCard';
import { QuestionInfoSidebar } from '@/components/AddExamQuestion/QuestionInfoSidebar';

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
