import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from './services/api/api';
import { Question, Exam } from '../components/ExamForm/ExamFormTypes';
import ExamFormHeader from '../components/ExamForm/ExamFormHeader';
import ExamFormBasicInfo from '../components/ExamForm/ExamFormBasicInfo';
import ExamFormScheduling from '../components/ExamForm/ExamFormScheduling';
import ExamFormQuestions from '../components/ExamForm/ExamFormQuestions';
import ExamFormActions from '../components/ExamForm/ExamFormActions';

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

      const response = await fetch(`${API_BASE_URL}/exam/get`, {
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
        ? `${API_BASE_URL}/exam/update?exam_id=${id}`
        : `${API_BASE_URL}/exam/creation`;

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
        <ExamFormHeader isEditMode={isEditMode} />

        <form className="space-y-6">
          <ExamFormBasicInfo 
            title={title}
            handleTitleChange={handleTitleChange}
            titleError={titleError}
            category={category}
            handleCategoryChange={handleCategoryChange}
            categoryError={categoryError}
            collage={collage}
            handleCollageChange={handleCollageChange}
            collageError={collageError}
            description={description}
            setDescription={setDescription}
          />

          <ExamFormScheduling 
            windowStartDate={windowStartDate}
            setWindowStartDate={setWindowStartDate}
            windowStartTime={windowStartTime}
            setWindowStartTime={setWindowStartTime}
            windowEndDate={windowEndDate}
            setWindowEndDate={setWindowEndDate}
            windowEndTime={windowEndTime}
            setWindowEndTime={setWindowEndTime}
            duration={duration}
            setDuration={setDuration}
            today={today}
          />

          <ExamFormQuestions 
            questions={questions}
            addQuestion={addQuestion}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
          />

          <ExamFormActions 
            loading={loading}
            isEditMode={isEditMode}
            handleSubmit={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
}
