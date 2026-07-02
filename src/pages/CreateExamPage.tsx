import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2, Calendar, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

interface ExamQuestion {
  question_bank_id: number;
  score: number;
}

export default function CreateExamPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

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
        {/* Header */}
        <div className="bg-[#6366f1] text-white py-6 px-10 relative">
          <div className="w-full">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Create New Exam</h1>
            <p className="text-indigo-100 text-[14px]">Fill in the details to schedule a new examination</p>
            <button
              onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })}
              className="absolute top-6 right-8 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full py-6 sm:py-8 px-4 sm:px-8 pb-16">
            {/* <Button onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })} variant="ghost" className="mb-6 text-gray-500 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Exam Management
            </Button> */}
            <form id="create-exam-form" onSubmit={handleCreateExam} className="space-y-6">

              {/* Basic Information */}
              <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
                <CardContent className="p-4 sm:p-8">
                  <h3 className="text-[18px] font-bold text-[#1e293b] mb-6">Basic Information</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[14px] font-semibold text-[#1e293b]">Exam Title <span className="text-red-500">*</span></Label>
                      <Input
                        value={examForm.title}
                        onChange={(e) => handleExamFormChange('title', e.target.value)}
                        maxLength={30}
                        placeholder="e.g., Final Examination - Computer Science"
                        required
                        className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Select Course <span className="text-red-500">*</span></Label>
                        <select
                          value={examForm.course_id}
                          onChange={(e) => handleExamFormChange('course_id', e.target.value)}
                          required
                          className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                        >
                          <option value="" disabled>Select a course</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id.toString()}>{c.title} (ID: {c.id})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Category <span className="text-red-500">*</span></Label>
                        <Input
                          value={examForm.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^[a-zA-Z\s]*$/.test(val)) {
                              handleExamFormChange('category', val);
                            }
                          }}
                          placeholder="e.g., technical"
                          maxLength={25}
                          required
                          className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
                <CardContent className="p-4 sm:p-8">
                  <h3 className="text-[18px] font-bold text-[#1e293b] mb-5">Description</h3>
                  <div className="space-y-3">
                    <textarea
                      className="w-full border border-slate-200 p-4 rounded-[14px] min-h-[120px] bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] resize-none text-[15px] text-slate-900 font-medium placeholder:text-slate-400 transition-all"
                      placeholder="Provide a brief description about this exam..."
                      value={examForm.description}
                      maxLength={200}
                      onChange={(e) => handleExamFormChange('description', e.target.value)}
                    />
                    <p className="text-[13px] text-slate-500 font-medium">
                      This description will be visible to students when they view the exam
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
                <CardContent className="p-4 sm:p-8">
                  <h3 className="text-[18px] font-bold text-[#1e293b] mb-6">Scheduling</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Window Start Date <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            type="date"
                            value={examForm.window_start ? examForm.window_start.split('T')[0] : ''}
                            min={todayStr}
                            max={maxDateStr}
                            onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                            onChange={(e) => {
                              const time = examForm.window_start && examForm.window_start.includes('T')
                                ? examForm.window_start.split('T')[1]
                                : (() => {
                                    const now = new Date();
                                    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                  })();
                              handleExamFormChange('window_start', `${e.target.value}T${time}`);
                            }}
                            required
                            className="pl-12 h-12 w-full rounded-[14px] bg-white border border-slate-200 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Start Time <span className="text-red-500">*</span></Label>
                        <Input
                          type="time"
                          value={examForm.window_start && examForm.window_start.includes('T') ? examForm.window_start.split('T')[1] : ''}
                          min={getMinTimeForStartDate()}
                          onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                          onChange={(e) => {
                            const date = examForm.window_start ? examForm.window_start.split('T')[0] : getLocalDateString();
                            handleExamFormChange('window_start', `${date}T${e.target.value}`);
                          }}
                          required
                          className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Window End Date <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <Input
                            type="date"
                            value={examForm.window_end ? examForm.window_end.split('T')[0] : ''}
                            min={todayStr}
                            max={maxDateStr}
                            onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                            onChange={(e) => {
                              const time = examForm.window_end && examForm.window_end.includes('T')
                                ? examForm.window_end.split('T')[1]
                                : (() => {
                                    if (examForm.window_start && examForm.window_start.includes('T')) {
                                      return examForm.window_start.split('T')[1];
                                    }
                                    const now = new Date();
                                    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                  })();
                              handleExamFormChange('window_end', `${e.target.value}T${time}`);
                            }}
                            required
                            className="pl-12 h-12 w-full rounded-[14px] bg-white border border-slate-200 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">End Time <span className="text-red-500">*</span></Label>
                        <Input
                          type="time"
                          value={examForm.window_end && examForm.window_end.includes('T') ? examForm.window_end.split('T')[1] : ''}
                          min={getMinTimeForEndDate()}
                          onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                          onChange={(e) => {
                            const date = examForm.window_end ? examForm.window_end.split('T')[0] : getLocalDateString();
                            handleExamFormChange('window_end', `${date}T${e.target.value}`);
                          }}
                          required
                          className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label className="text-[14px] font-semibold text-[#1e293b]">Duration (minutes) <span className="text-red-500">*</span></Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={5}
                        value={examForm.duration}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                          handleExamFormChange('duration', val);
                        }}
                        placeholder="e.g., 120"
                        required
                        className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Settings */}
              {/* <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
                <CardContent className="p-4 sm:p-8">
                  <h3 className="text-[18px] font-bold text-[#1e293b] mb-6">Exam Settings</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Max Attempts</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={2}
                          value={settings.maxAttempts}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                            setSettings({ ...settings, maxAttempts: val });
                          }}
                          className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1e293b]">Passing Score (%)</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          value={settings.passingScore}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                            setSettings({ ...settings, passingScore: val });
                          }}
                          className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-[14px] bg-white">
                      <Label htmlFor="shuffle" className="text-[14px] font-semibold text-[#1e293b] cursor-pointer flex-1">Shuffle Questions</Label>
                      <input
                        type="checkbox"
                        id="shuffle"
                        checked={settings.shuffleQuestions}
                        onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
                        className="w-4 h-4 rounded text-[#6366f1] focus:ring-[#6366f1]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-[14px] bg-white">
                      <Label htmlFor="negative" className="text-[14px] font-semibold text-[#1e293b] cursor-pointer flex-1">Enable Negative Marking</Label>
                      <input
                        type="checkbox"
                        id="negative"
                        checked={settings.negativeMarking}
                        onChange={(e) => setSettings({ ...settings, negativeMarking: e.target.checked })}
                        className="w-4 h-4 rounded text-[#6366f1] focus:ring-[#6366f1]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Questions */}
              <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
                <CardContent className="p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <div>
                      <h3 className="text-[18px] font-bold text-[#1e293b]">Questions</h3>
                      <p className="text-[13px] text-slate-500 font-medium mt-1">{totalQuestions} question added</p>
                    </div>
                    {/* <Button type="button" onClick={() => navigate('/exam-management/add-question')} className="w-full sm:w-auto bg-[#6366f1] hover:bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl text-[14px] font-medium shadow-none h-11">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button> */}
                  </div>

                  <div className="space-y-4">
                    {/* Selected Questions Display */}
                    {Object.entries(examForm.questions).length === 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border border-slate-200 rounded-[16px] bg-white">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-[14px] bg-[#6366f1] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0 shadow-sm">
                            Q1
                          </div>
                          <div className="flex-1">
                            <Input
                              readOnly
                              placeholder="Question Bank ID or Text"
                              className="h-12 bg-white border-0 text-[14px] placeholder:text-slate-500 focus-visible:ring-0 px-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          <div className="w-full sm:w-[100px]">
                            <Input
                              placeholder="Marks"
                              className="h-12 bg-white border border-slate-200 text-center text-[14px] rounded-[12px] text-slate-500 w-full"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-12 h-12 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] flex-shrink-0"
                          >
                            <Trash2 className="w-[18px] h-[18px] stroke-[1.5]" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {Object.entries(examForm.questions).map(([key, q], idx) => {
                      const bankQuestion = questionBank.find((bq) => (bq.question_id || bq.id) === q.question_bank_id);
                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border border-slate-200 rounded-[16px] bg-white">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-[14px] bg-[#6366f1] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0 shadow-sm">
                              Q{idx + 1}
                            </div>
                            <div className="flex-1">
                              <Input
                                readOnly
                                value={bankQuestion ? bankQuestion.title : `ID: ${q.question_bank_id}`}
                                className="h-12 bg-white border-0 text-[14px] text-slate-600 focus-visible:ring-0 px-2"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 justify-between sm:justify-end">
                            <div className="w-full sm:w-[100px]">
                              <Input
                                type="number"
                                value={q.score}
                                onChange={(e) => updateQuestionScore(key, parseInt(e.target.value) || 0)}
                                className="h-12 bg-white border border-slate-200 text-center text-[14px] rounded-[12px] text-slate-600 w-full"
                                placeholder="Marks"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => toggleQuestionSelection(q.question_bank_id)}
                              className="w-12 h-12 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] flex-shrink-0"
                            >
                              <Trash2 className="w-[18px] h-[18px] stroke-[1.5]" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Question Selector */}
                    <div className="mt-6 border border-slate-200 rounded-[16px] p-5 bg-white">
                      <Label className="text-[14px] font-bold text-[#1e293b] mb-4 block">Select from Question Bank</Label>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {questionBank.length === 0 ? (
                          <p className="text-[13px] text-slate-500 p-2">Loading questions...</p>
                        ) : (
                          questionBank.map((q) => {
                            const qId = q.question_id || q.id;
                            const isSelected = Object.values(examForm.questions).some((sq) => sq.question_bank_id === qId);
                            return (
                              <div key={qId} className="flex items-center gap-3 p-3 border border-slate-100 rounded-[12px] hover:bg-slate-50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleQuestionSelection(qId)}
                                  className="w-4 h-4 flex-shrink-0 cursor-pointer text-[#6366f1] focus:ring-[#6366f1] transition-all rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-bold text-[13px] text-[#1e293b]">{q.title}</p>
                                  <p className="text-[12px] text-slate-500 truncate">{q.question}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Summary */}
              <div className="bg-[#eef2ff] border border-[#bfdbfe] rounded-[16px] p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 mt-8 sm:mt-12 mb-8">
                <div className="flex-1 w-full">
                  <h3 className="text-[18px] font-bold text-[#1e293b] mb-6 sm:mb-8">Exam Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                    <div>
                      <p className="text-[13px] font-medium text-slate-500 mb-2">Total Questions</p>
                      <p className="text-[20px] font-bold text-[#1e293b]">{totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-slate-500 mb-2">Total Marks</p>
                      <p className="text-[20px] font-bold text-[#1e293b]">{totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-slate-500 mb-2">Duration</p>
                      <p className="text-[20px] font-bold text-[#1e293b]">{examForm.duration || '0'} min</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-slate-500 mb-2">Exam Window</p>
                      <p className="text-[14px] font-medium text-[#1e293b] break-words">
                        {examForm.window_start ? new Date(examForm.window_start.split('T')[0]).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-end border-t border-slate-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
                <div className="flex w-full sm:w-auto gap-4">
                  {/* <Button type="button" variant="outline" className="rounded-[14px] font-medium border-[#3b82f6] text-[#3b82f6] hover:bg-blue-50 h-[52px] px-8 text-[15px]">
                    Save as Draft
                  </Button> */}
                  <Button
                    type="submit"
                    form="create-exam-form"
                    className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-[14px] font-medium h-[52px] px-8 shadow-sm text-[15px] w-full"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Exam'}
                  </Button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
