import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Clock, RefreshCw, X, Edit, AlertTriangle } from 'lucide-react';
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
 
const Exams = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [fetching, setFetching] = useState(false);
 
  // Form visibility & mode
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
 
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collage, setCollage] = useState('');
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [duration, setDuration] = useState<number | ''>(20);
  const [category, setCategory] = useState('texc');
  const [questions, setQuestions] = useState<Question[]>([
    { key: '1', question_bank_id: 1, score: 10 },
  ]);
  const [isActive, setIsActive] = useState<number>(0); // for update only
 
  const addQuestion = () => {
    const nextKey = (questions.length + 1).toString();
    setQuestions([...questions, { key: nextKey, question_bank_id: 1, score: 10 }]);
  };
 
  const removeQuestion = (key: string) => {
    if (questions.length <= 1) {
      toast.error("At least one question is required");
      return;
    }
    setQuestions(questions.filter(q => q.key !== key));
  };
 
  const updateQuestion = (key: string, field: 'question_bank_id' | 'score', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    setQuestions(questions.map(q =>
      q.key === key ? { ...q, [field]: numValue } : q
    ));
  };
 
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCollage('');
    setWindowStart('');
    setWindowEnd('');
    setDuration(20);
    setCategory('texc');
    setQuestions([{ key: '1', question_bank_id: 1, score: 10 }]);
    setIsActive(0);
    setIsEditMode(false);
    setEditingExamId(null);
    setShowForm(false);
  };
 
  const openEditForm = (exam: Exam) => {
    setIsEditMode(true);
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setCollage(exam.collage);
    setWindowStart(exam.window_start.slice(0, 16)); // compatible with datetime-local
    setWindowEnd(exam.window_end.slice(0, 16));
    setDuration(exam.duration);
    setCategory(exam.category);
    setIsActive(exam.is_active);
 
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
 
    setShowForm(true);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!title.trim() || !collage.trim()) {
      toast.error("Title and collage are required");
      return;
    }
    if (!windowStart || !windowEnd) {
      toast.error("Please select exam window start & end");
      return;
    }
    if (!duration || duration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }
 
    const hasInvalidQuestion = questions.some(q =>
      q.question_bank_id < 1 || q.score < 1
    );
    if (hasInvalidQuestion) {
      toast.error("All questions must have valid bank ID (>0) and score (>0)");
      return;
    }
 
    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      collage: collage.trim().toUpperCase(),
      window_start: windowStart,
      window_end: windowEnd,
      duration: Number(duration),
      category: category.trim(),
      questions: {} as Record<string, { question_bank_id: number; score: number }>,
    };
 
    if (isEditMode) {
      payload.is_active = isActive;
    }
 
    questions.forEach(q => {
      payload.questions[q.key] = {
        question_bank_id: q.question_bank_id,
        score: q.score,
      };
    });
 
    setLoading(true);
 
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error("No access token found. Please login again.");
        navigate('/login');
        return;
      }
 
      const url = isEditMode
        ? `https://lauratek.in:8000/exam/update?exam_id=${editingExamId}`
        : 'https://lauratek.in:8000/exam/creation';
 
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
 
      const result = await response.json();
 
      if (!response.ok) {
        throw new Error(result.message || result.error || (isEditMode ? 'Update failed' : 'Creation failed'));
      }
 
      toast.success(isEditMode ? 'Exam updated successfully!' : 'Exam created successfully!');
      resetForm();
      fetchExams();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };
 
  const handleDelete = async (examId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" (ID: ${examId})?`)) {
      return;
    }
 
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error("No access token found.");
        return;
      }
 
      const response = await fetch(`https://lauratek.in:8000/exam/delete?exam_id=${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
 
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Delete failed');
      }
 
      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not delete exam');
    }
  };
 
  const fetchExams = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error("Please login to view exams");
        navigate('/login');
        return;
      }
 
      const response = await fetch('https://lauratek.in:8000/exam/get', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
 
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch exams');
      }
 
      const data = await response.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not load exams');
    } finally {
      setFetching(false);
    }
  };
 
  useEffect(() => {
    fetchExams();
  }, []);
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
 
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-800">Exams</h1>
          <div className="flex gap-3">
            <Button
              onClick={fetchExams}
              variant="outline"
              disabled={fetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Exam
            </Button>
          </div>
        </div>
 
        {/* Exam List */}
        {fetching ? (
          <Card>
            <CardContent className="pt-10 text-center text-muted-foreground">
              Loading exams...
            </CardContent>
          </Card>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="pt-10 text-center text-muted-foreground">
              No exams found. Create your first exam!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50 pb-4">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-3">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <span className="text-sm font-medium text-muted-foreground">
                        ID: {exam.id}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(exam)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(exam.id, exam.title)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {exam.collage} • {exam.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-sm">
                  <p className="text-muted-foreground line-clamp-2">
                    {exam.description || 'No description'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Start:</span><br />
                      {new Date(exam.window_start).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">End:</span><br />
                      {new Date(exam.window_end).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs">
                    Duration: {exam.duration} min • Questions: {Object.keys(exam.questions).length}
                  </div>
                  <div className="pt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {exam.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
 
        {/* Create / Edit Exam Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto border-none shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {isEditMode ? 'Edit Exam' : 'Create New Exam'}
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {isEditMode ? 'Update the exam details' : 'Fill in the details to schedule a new examination'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetForm}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </CardHeader>
 
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Exam Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Mid Term - Code - 2026"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collage">Collage / Branch Code *</Label>
                      <Input
                        id="collage"
                        value={collage}
                        onChange={e => setCollage(e.target.value.toUpperCase())}
                        placeholder="CSE / ECE / SMVM / ..."
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="This is an online examination for ..."
                      rows={3}
                    />
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Window Start *</Label>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={windowStart}
                          onChange={e => setWindowStart(e.target.value)}
                          required
                        />
                        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <Label>Window End *</Label>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={windowEnd}
                          onChange={e => setWindowEnd(e.target.value)}
                          required
                        />
                        <Clock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="300"
                        value={duration}
                        onChange={e => setDuration(e.target.value ? Number(e.target.value) : '')}
                        required
                      />
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="texc / mcq / coding / ..."
                    />
                  </div>
 
                  {isEditMode && (
                    <div className="space-y-2">
                      <Label htmlFor="is_active">Status</Label>
                      <select
                        id="is_active"
                        value={isActive}
                        onChange={e => setIsActive(Number(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value={0}>Inactive</option>
                        <option value={1}>Active</option>
                      </select>
                    </div>
                  )}
 
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg">Questions</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuestion}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </div>
 
                    <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                      {questions.map((q) => (
                        <div key={q.key} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-white p-4 rounded border shadow-sm">
                          <div className="sm:col-span-1 text-center font-medium text-muted-foreground">
                            Q{q.key}
                          </div>
                          <div className="sm:col-span-5 space-y-1.5">
                            <Label className="text-xs">Question Bank ID</Label>
                            <Input
                              type="number"
                              min="1"
                              value={q.question_bank_id}
                              onChange={e => updateQuestion(q.key, 'question_bank_id', e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-5 space-y-1.5">
                            <Label className="text-xs">Score / Marks</Label>
                            <Input
                              type="number"
                              min="1"
                              value={q.score}
                              onChange={e => updateQuestion(q.key, 'score', e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-1">
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
                    </div>
                  </div>
 
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-w-[160px]"
                    >
                      {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Exam' : 'Create Exam')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Exams;
 