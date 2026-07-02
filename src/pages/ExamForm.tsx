import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Calendar, Clock, ArrowLeft, Save, FilePlus, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  key: string;
  question_bank_id: number;
  score: number;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  collage: string;
  window_start: string;
  window_end: string;
  duration: number;
  category: string;
  questions: Record<string, { question_bank_id: number; score: number }>;
  is_active: number;
}

export default function ExamForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchingExam, setFetchingExam] = useState(false);
  
  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  // Form fields
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [collage, setCollage] = useState('');
  const [collageError, setCollageError] = useState('');
  const [category, setCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [windowStartDate, setWindowStartDate] = useState('');
  const [windowStartTime, setWindowStartTime] = useState('');
  const [windowEndDate, setWindowEndDate] = useState('');
  const [windowEndTime, setWindowEndTime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [maxAttempts, setMaxAttempts] = useState<number | ''>('');
  const [passingScore, setPassingScore] = useState<number | ''>('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { key: '1', question_bank_id: 1, score: 10 },
  ]);
  const [isActive, setIsActive] = useState<number>(0);

  // Fetch exam data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchExamData(Number(id));
    }
  }, [id]);

  const fetchExamData = async (examId: number) => {
    setFetchingExam(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No access token found. Please login again.');
        navigate('/login');
        return;
      }

      const response = await fetch('https://lauratek.in:8000/exam/get', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam data');
      }

      const exams: Exam[] = await response.json();
      const exam = exams.find((e) => e.id === examId);

      if (!exam) {
        toast.error('Exam not found');
        navigate('/exams');
        return;
      }

      setTitle(exam.title);
      setTitleError('');
      setDescription(exam.description || '');
      setCollage(exam.collage);
      setCollageError('');
      setCategory(exam.category);
      setCategoryError('');
      setIsActive(exam.is_active);

      // Parse window start
      const startDate = new Date(exam.window_start);
      setWindowStartDate(startDate.toISOString().split('T')[0]);
      setWindowStartTime(startDate.toTimeString().slice(0, 5));

      // Parse window end
      const endDate = new Date(exam.window_end);
      setWindowEndDate(endDate.toISOString().split('T')[0]);
      setWindowEndTime(endDate.toTimeString().slice(0, 5));

      setDuration(exam.duration);

      // Convert questions object to array
      const qArray: Question[] = [];
      Object.entries(exam.questions).forEach(([key, val]) => {
        qArray.push({
          key,
          question_bank_id: val.question_bank_id,
          score: val.score,
        });
      });
      setQuestions(qArray.length > 0 ? qArray : [{ key: '1', question_bank_id: 1, score: 10 }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not load exam data');
    } finally {
      setFetchingExam(false);
    }
  };

  const addQuestion = () => {
    const nextKey = (questions.length + 1).toString();
    setQuestions([...questions, { key: nextKey, question_bank_id: 1, score: 10 }]);
  };

  const removeQuestion = (key: string) => {
    if (questions.length <= 1) {
      toast.error('At least one question is required');
      return;
    }
    setQuestions(questions.filter((q) => q.key !== key));
  };

  const updateQuestion = (key: string, field: 'question_bank_id' | 'score', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    setQuestions(questions.map((q) => (q.key === key ? { ...q, [field]: numValue } : q)));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only alphabetic characters and spaces, max 20 characters
    const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
    setTitle(alphabeticValue);
    
    if (alphabeticValue.length === 0 && value.length > 0) {
      setTitleError('Only alphabets are allowed');
    } else if (alphabeticValue.length === 20 && value.length > 20) {
      setTitleError('Maximum 20 characters allowed');
    } else {
      setTitleError('');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only alphabetic characters and spaces, max 20 characters
    const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
    setCategory(alphabeticValue);
    
    if (alphabeticValue.length === 0 && value.length > 0) {
      setCategoryError('Only alphabets are allowed');
    } else if (alphabeticValue.length === 20 && value.length > 20) {
      setCategoryError('Maximum 20 characters allowed');
    } else {
      setCategoryError('');
    }
  };

  const handleCollageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Allow alphanumeric characters, max 10 characters
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    setCollage(alphanumericValue);
    
    if (alphanumericValue.length === 0 && value.length > 0) {
      setCollageError('Only alphanumeric characters are allowed');
    } else if (alphanumericValue.length === 10 && value.length > 10) {
      setCollageError('Maximum 10 characters allowed');
    } else {
      setCollageError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();

    if (!title.trim() || !collage.trim()) {
      toast.error('Title and Course/Branch Code are required');
      return;
    }
    if (titleError) {
      toast.error(titleError);
      return;
    }
    if (categoryError) {
      toast.error(categoryError);
      return;
    }
    if (collageError) {
      toast.error(collageError);
      return;
    }
    if (!windowStartDate || !windowStartTime || !windowEndDate || !windowEndTime) {
      toast.error('Please select exam window start & end dates and times');
      return;
    }
    if (!duration || duration <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    const hasInvalidQuestion = questions.some((q) => q.question_bank_id < 1 || q.score < 1);
    if (hasInvalidQuestion) {
      toast.error('All questions must have valid bank ID (>0) and score (>0)');
      return;
    }

    const windowStart = `${windowStartDate}T${windowStartTime}`;
    const windowEnd = `${windowEndDate}T${windowEndTime}`;

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      collage: collage.trim().toUpperCase(),
      window_start: windowStart,
      window_end: windowEnd,
      duration: Number(duration),
      category: category.trim() || 'General',
      questions: {} as Record<string, { question_bank_id: number; score: number }>,
    };

    if (isEditMode) {
      payload.is_active = isActive;
    }

    questions.forEach((q) => {
      payload.questions[q.key] = {
        question_bank_id: q.question_bank_id,
        score: q.score,
      };
    });

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No access token found. Please login again.');
        navigate('/login');
        return;
      }

      const url = isEditMode
        ? `https://lauratek.in:8000/exam/update?exam_id=${id}`
        : 'https://lauratek.in:8000/exam/creation';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || (isEditMode ? 'Update failed' : 'Creation failed')
        );
      }

      if (saveAsDraft) {
        toast.success('Exam saved as draft!');
      } else {
        toast.success(isEditMode ? 'Exam updated successfully!' : 'Exam created successfully!');
      }
      navigate('/exams');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total marks and duration
  const totalMarks = questions.reduce((sum, q) => sum + q.score, 0);
  const totalQuestions = questions.length;
  const examDuration = duration || 0;

  if (fetchingExam) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 md:p-3">
        <div className="w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading exam data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/exams')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit New Exam' : 'Create New Exam'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditMode ? 'Update the details to schedule a examination' : 'Fill in the details to schedule a new examination'}
            </p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Exam Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Final Examination"
                    required
                    maxLength={20}
                  />
                  {titleError && <p className="text-red-500 text-xs mt-1">{titleError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={handleCategoryChange}
                    placeholder="e.g., Science"
                    required
                    maxLength={20}
                  />
                  {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="collage" className="text-sm font-medium text-gray-700">
                    Course / Branch Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="collage"
                    value={collage}
                    onChange={handleCollageChange}
                    placeholder="e.g., CS101"
                    required
                    maxLength={10}
                  />
                  {collageError && <p className="text-red-500 text-xs mt-1">{collageError}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief description about this exam..."
                  rows={3}
                />
                <p className="text-xs text-gray-400">
                  This description will be visible to students when they view the exam.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Window Start */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Window Start Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={windowStartDate}
                      onChange={(e) => setWindowStartDate(e.target.value)}
                      required
                      min={today}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={windowStartTime}
                      onChange={(e) => setWindowStartTime(e.target.value)}
                      required
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Window End */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Window End Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={windowEndDate}
                      onChange={(e) => setWindowEndDate(e.target.value)}
                      required
                      min={today}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={windowEndTime}
                      onChange={(e) => setWindowEndTime(e.target.value)}
                      required
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 120"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Exam Settings */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Exam Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts" className="text-sm font-medium text-gray-700">
                    Max Attempts
                  </Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g., 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingScore" className="text-sm font-medium text-gray-700">
                    Passing Score (%)
                  </Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g., 60"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-700">Shuffle Questions</Label>
                    <p className="text-xs text-gray-400">Randomize question order for each student</p>
                  </div>
                  <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-700">Enable Negative Marking</Label>
                    <p className="text-xs text-gray-400">Deduct marks for incorrect answers</p>
                  </div>
                  <Switch checked={enableNegativeMarking} onCheckedChange={setEnableNegativeMarking} />
                </div>
              </div>

              {isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <select
                    id="is_active"
                    value={isActive}
                    onChange={(e) => setIsActive(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={0}>Inactive</option>
                    <option value={1}>Active</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">Questions</CardTitle>
                <Button type="button" onClick={addQuestion} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={q.key}
                  className="grid grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg border"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="col-span-6 space-y-1">
                    <Label className="text-xs text-gray-500">Question Bank ID or Question Text</Label>
                    <Input
                      type="number"
                      min="1"
                      value={q.question_bank_id}
                      onChange={(e) => updateQuestion(q.key, 'question_bank_id', e.target.value)}
                      placeholder="Enter ID"
                    />
                  </div>
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs text-gray-500">Marks</Label>
                    <Input
                      type="number"
                      min="1"
                      value={q.score}
                      onChange={(e) => updateQuestion(q.key, 'score', e.target.value)}
                      placeholder="Marks"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(q.key)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Exam Summary */}
          {/* <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-base font-semibold text-gray-900">Exam Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-purple-600">{totalQuestions}</p>
                  <p className="text-sm text-gray-500">Total Questions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-purple-600">{totalMarks}</p>
                  <p className="text-sm text-gray-500">Total Marks</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-purple-600">{examDuration}</p>
                  <p className="text-sm text-gray-500">Duration (min)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-purple-600">Not set</p>
                  <p className="text-sm text-gray-500">Passing Score</p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/exams')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <FilePlus className="h-4 w-4" />
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Exam'
                : 'Create Exam'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
