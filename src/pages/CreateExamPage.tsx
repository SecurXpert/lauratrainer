import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from "./services/api/api";
import { ExamFormState, ExamQuestion } from '../components/CreateExamPage/CreateExamTypes';
import CreateExamHeader from '../components/CreateExamPage/CreateExamHeader';
import CreateExamBasicInfo from '../components/CreateExamPage/CreateExamBasicInfo';
import CreateExamDescription from '../components/CreateExamPage/CreateExamDescription';
import CreateExamScheduling from '../components/CreateExamPage/CreateExamScheduling';
import CreateExamQuestions from '../components/CreateExamPage/CreateExamQuestions';
import CreateExamSummary from '../components/CreateExamPage/CreateExamSummary';
import CreateExamFooter from '../components/CreateExamPage/CreateExamFooter';

export default function CreateExamPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [examForm, setExamForm] = useState<ExamFormState>({
    title: '',
    description: '',
    course_id: '',
    window_start: '',
    window_end: '',
    duration: '',
    category: '',
    questions: {},
  });

  // UI-only state for settings (to match design)
  const [settings, setSettings] = useState({
    maxAttempts: '',
    passingScore: '',
    shuffleQuestions: false,
    negativeMarking: false
  });

  // Fetch question bank for selection
  useEffect(() => {
    const fetchQuestionBank = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/compiler-questions/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setQuestionBank(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestionBank();
  }, [token]);

  // Fetch trainer courses for selection
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/trainer/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, [token]);

  const handleExamFormChange = (field: string, value: any) => {
    setExamForm((prev) => {
      let updated = { ...prev, [field]: value };

      if (field === 'window_start' || field === 'window_end' || field === 'duration') {
        const startStr = field === 'window_start' ? value : prev.window_start;
        const endStr = field === 'window_end' ? value : prev.window_end;

        // Prevent selecting start date/time in the past
        if (startStr && startStr.includes('T')) {
          const start = new Date(startStr);
          if (!isNaN(start.getTime())) {
            const now = new Date();
            // Provide 1 minute buffer for slow selection/typing
            if (start.getTime() < now.getTime() - 60000) {
              toast.error("Start date and time cannot be in the past");
              return prev;
            }
          }
        }

        // Prevent selecting end date/time in the past
        if (endStr && endStr.includes('T')) {
          const end = new Date(endStr);
          if (!isNaN(end.getTime())) {
            const now = new Date();
            if (end.getTime() < now.getTime() - 60000) {
              toast.error("End date and time cannot be in the past");
              return prev;
            }
          }
        }
        
        if (startStr && endStr) {
          const start = new Date(startStr);
          const end = new Date(endStr);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            // Check if end is before start
            if (end.getTime() < start.getTime()) {
              if (field === 'window_end') {
                toast.error("End date/time cannot be before start date/time");
                return prev; // Keep previous state
              } else if (field === 'window_start') {
                // Adjust end date to match new start date
                updated.window_end = value;
              }
            }

            // Recalculate max duration with the updated dates
            const startUpdated = new Date(updated.window_start);
            const endUpdated = new Date(updated.window_end);
            const diffMs = endUpdated.getTime() - startUpdated.getTime();
            const maxDurationMinutes = Math.max(0, Math.floor(diffMs / 60000));
            
            const durationStr = field === 'duration' ? value : updated.duration;
            if (durationStr) {
              const durationNum = parseInt(durationStr, 10);
              if (durationNum > maxDurationMinutes) {
                toast.error(`Duration cannot exceed the scheduling window of ${maxDurationMinutes} minutes.`);
                updated.duration = String(maxDurationMinutes);
              }
            }
          }
        }
      }

      return updated;
    });
  };

  const toggleQuestionSelection = (questionId: number) => {
    setExamForm((prev) => {
      const isCurrentlySelected = Object.values(prev.questions).some(
        (sq) => sq.question_bank_id === questionId
      );

      let newQuestionsList: { question_bank_id: number; score: number }[] = [];

      if (isCurrentlySelected) {
        // Deselect if already selected (filter it out)
        newQuestionsList = Object.values(prev.questions).filter(
          (sq) => sq.question_bank_id !== questionId
        );
      } else {
        // Add it to the selection
        newQuestionsList = [
          ...Object.values(prev.questions),
          { question_bank_id: questionId, score: 10 }
        ];
      }

      // Rebuild with sequential string keys starting from "1"
      const rebuiltQuestions: Record<string, { question_bank_id: number; score: number }> = {};
      newQuestionsList.forEach((sq, idx) => {
        rebuiltQuestions[String(idx + 1)] = sq;
      });

      return {
        ...prev,
        questions: rebuiltQuestions
      };
    });
  };

  const updateQuestionScore = (key: string, score: number) => {
    setExamForm((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [key]: { ...prev.questions[key], score },
      },
    }));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (examForm.window_start) {
      const start = new Date(examForm.window_start);
      const now = new Date();
      if (!isNaN(start.getTime()) && start.getTime() < now.getTime() - 60000) {
        toast.error("Start date and time cannot be in the past");
        return;
      }
    }

    if (examForm.window_end) {
      const end = new Date(examForm.window_end);
      const now = new Date();
      if (!isNaN(end.getTime()) && end.getTime() < now.getTime() - 60000) {
        toast.error("End date and time cannot be in the past");
        return;
      }
    }

    setLoading(true);

    try {
      const selectedCourse = courses.find((c) => String(c.id) === String(examForm.course_id));
      const payload = {
        title: examForm.title.trim(),
        description: examForm.description.trim(),
        course_id: Number(examForm.course_id),
        collage: (selectedCourse?.title || selectedCourse?.code || 'CS101').trim().toUpperCase(),
        window_start: examForm.window_start,
        window_end: examForm.window_end,
        duration: Number(examForm.duration),
        category: examForm.category.trim() || 'General',
        questions: examForm.questions,
      };

      const res = await fetch(`${API_BASE_URL}/exam/creation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create exam');

      toast.success('Exam created successfully');
      navigate('/exam-management');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = Object.keys(examForm.questions).length;
  const totalMarks = Object.values(examForm.questions).reduce((sum, q) => sum + q.score, 0);

  // Date range for Window Start Date: today → today + 7 days
  const getLocalDateString = (d: Date = new Date()) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalDateString();
  const maxDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return getLocalDateString(d);
  })();

  const getMinTimeForStartDate = () => {
    const selectedDate = examForm.window_start ? examForm.window_start.split('T')[0] : '';
    if (selectedDate === todayStr) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return undefined;
  };

  const getMinTimeForEndDate = () => {
    const startDate = examForm.window_start ? examForm.window_start.split('T')[0] : '';
    const endDate = examForm.window_end ? examForm.window_end.split('T')[0] : '';
    if (startDate && endDate && startDate === endDate) {
      const startTime = examForm.window_start && examForm.window_start.includes('T')
        ? examForm.window_start.split('T')[1]
        : '';
      return startTime || undefined;
    }
    if (endDate === todayStr) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return undefined;
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="w-full w-full bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <CreateExamHeader />

        <div className="flex-1 overflow-y-auto">
          <div className="w-full py-6 sm:py-8 px-4 sm:px-8 pb-16">
            <form id="create-exam-form" onSubmit={handleCreateExam} className="space-y-6">
              
              <CreateExamBasicInfo 
                title={examForm.title}
                course_id={examForm.course_id}
                category={examForm.category}
                courses={courses}
                handleExamFormChange={handleExamFormChange}
              />

              <CreateExamDescription 
                description={examForm.description}
                handleExamFormChange={handleExamFormChange}
              />

              <CreateExamScheduling 
                window_start={examForm.window_start}
                window_end={examForm.window_end}
                duration={examForm.duration}
                todayStr={todayStr}
                maxDateStr={maxDateStr}
                getMinTimeForStartDate={getMinTimeForStartDate}
                getMinTimeForEndDate={getMinTimeForEndDate}
                getLocalDateString={getLocalDateString}
                handleExamFormChange={handleExamFormChange}
              />

              <CreateExamQuestions 
                questions={examForm.questions}
                questionBank={questionBank}
                totalQuestions={totalQuestions}
                updateQuestionScore={updateQuestionScore}
                toggleQuestionSelection={toggleQuestionSelection}
              />

              <CreateExamSummary 
                totalQuestions={totalQuestions}
                totalMarks={totalMarks}
                duration={examForm.duration}
                window_start={examForm.window_start}
              />

              <CreateExamFooter loading={loading} />

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
