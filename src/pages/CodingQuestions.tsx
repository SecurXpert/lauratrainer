import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Code2, X, Edit, List, Upload } from 'lucide-react';
import { toast } from 'sonner';
 
interface TestCase {
  testcase: number;
  input: string;
  output: string;
}
 
interface Question {
  question_id: number;
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: TestCase[];
  suggestion: string[];
}
 
interface QuestionForm {
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: { input: string; output: string }[];
  suggestion: string[];
}
 
const initialForm: QuestionForm = {
  title: '',
  question: '',
  description: '',
  sample_inputs: '',
  sample_outputs: '',
  test_cases: [{ input: '', output: '' }],
  suggestion: [''],
};
 
const API_BASE = 'https://lauratek.in:8000/compiler-questions';
 
const CodingQuestions = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<QuestionForm>(initialForm);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const token = localStorage.getItem('access_token');
  if (!token) {
    toast.error('Please login first');
    navigate('/login', { replace: true });
    return null;
  }
 
  const fetchQuestions = async () => {
    try {
      setFetching(true);
      const res = await fetch(`${API_BASE}/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      console.log("Fetched questions:", data);
      setQuestions(data);
    } catch (err: any) {
      toast.error(err.message || 'Could not load questions');
    } finally {
      setFetching(false);
    }
  };
 
  useEffect(() => {
    fetchQuestions();
  }, []);
 
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof QuestionForm
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };
 
  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    setForm((prev) => {
      const newTestCases = [...prev.test_cases];
      newTestCases[index] = { ...newTestCases[index], [field]: value };
      return { ...prev, test_cases: newTestCases };
    });
  };
 
  const addTestCase = () => {
    setForm((prev) => ({
      ...prev,
      test_cases: [...prev.test_cases, { input: '', output: '' }],
    }));
  };
 
  const removeTestCase = (index: number) => {
    if (form.test_cases.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index),
    }));
  };
 
  const addSuggestion = () => {
    setForm((prev) => ({
      ...prev,
      suggestion: [...prev.suggestion, ''],
    }));
  };
 
  const removeSuggestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      suggestion: prev.suggestion.filter((_, i) => i !== index),
    }));
  };
 
  const handleSuggestionChange = (index: number, value: string) => {
    setForm((prev) => {
      const newSuggestions = [...prev.suggestion];
      newSuggestions[index] = value;
      return { ...prev, suggestion: newSuggestions };
    });
  };
 
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(false);
  };
 
  const preparePayload = () => ({
    title: form.title.trim(),
    question: form.question.trim(),
    description: form.description.trim(),
    sample_inputs: form.sample_inputs.trim(),
    sample_outputs: form.sample_outputs.trim(),
    test_cases: form.test_cases.map((tc, index) => ({
      testcase: index + 1,
      input: tc.input.trim(),
      output: tc.output.trim(),
    })),
    suggestion: form.suggestion.filter((s) => s.trim() !== '').map((s) => s.trim()),
  });
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!form.title.trim() || !form.question.trim()) {
      toast.error('Title and Question are required');
      return;
    }
 
    if (form.test_cases.some((tc) => !tc.input.trim() || !tc.output.trim())) {
      toast.error('All test cases must have both input and output');
      return;
    }
 
    const isEdit = editingId !== null && !isNaN(editingId);
 
    if (isEdit && (editingId == null || editingId <= 0)) {
      toast.error("Cannot update: invalid question ID");
      return;
    }
 
    setLoading(true);
 
    const url = isEdit
      ? `${API_BASE}/update?question_id=${editingId}`
      : `${API_BASE}/add`;
 
    try {
      const payload = preparePayload();
 
      console.log("→ SUBMIT MODE:", isEdit ? "UPDATE" : "CREATE");
      console.log("→ URL:", url);
      console.log("→ editingId:", editingId);
      console.log("→ Payload:", JSON.stringify(payload, null, 2));
 
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
 
      if (!res.ok) {
        let errorMsg = isEdit ? 'Failed to update question' : 'Failed to add question';
        try {
          const errData = await res.json();
          console.error("Server error response:", errData);
          if (errData.detail) {
            errorMsg = Array.isArray(errData.detail)
              ? errData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(' • ')
              : errData.detail;
          }
        } catch {}
        throw new Error(errorMsg);
      }
 
      toast.success(isEdit ? 'Question updated successfully!' : 'Question added successfully!');
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };
 
  const handleDelete = async (id: number) => {
    if (!id || isNaN(id)) {
      toast.error("Cannot delete: invalid question ID");
      return;
    }
 
    if (!confirm('Are you sure you want to delete this question?')) return;
 
    try {
      const url = `${API_BASE}/delete?question_id=${id}`;
      console.log("DELETE URL:", url);
 
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
 
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to delete question');
      }
 
      toast.success('Question deleted');
      fetchQuestions();
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err.message || 'Failed to delete question');
    }
  };
 
  const startEdit = (q: Question) => {
    if (!q.question_id || isNaN(q.question_id)) {
      console.error("Invalid question object - missing valid question_id", q);
      toast.error("Cannot edit: question ID is missing");
      return;
    }
 
    console.log("Starting edit - question:", q);
    console.log("question_id:", q.question_id);
 
    setForm({
      title: q.title || '',
      question: q.question || '',
      description: q.description || '',
      sample_inputs: q.sample_inputs || '',
      sample_outputs: q.sample_outputs || '',
      test_cases: (q.test_cases || []).map((tc) => ({
        input: tc.input || '',
        output: tc.output || '',
      })),
      suggestion: Array.isArray(q.suggestion) && q.suggestion.length > 0
        ? q.suggestion
        : [''],
    });
 
    setEditingId(q.question_id);
    setIsFormOpen(true);
  };
 
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a .csv file');
      return;
    }
 
    const formData = new FormData();
    formData.append('file', file);
 
    try {
      toast.loading('Uploading CSV...');
      const res = await fetch(`${API_BASE}/upload-csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
 
      if (!res.ok) {
        let msg = 'Failed to upload CSV';
        try {
          const err = await res.json();
          msg = err.detail || err.message || msg;
        } catch {}
        throw new Error(msg);
      }
 
      const result = await res.json().catch(() => ({}));
      toast.dismiss();
      toast.success(
        result.message ||
        result.inserted
          ? `Successfully added ${result.inserted} question(s)`
          : 'CSV uploaded successfully!'
      );
 
      fetchQuestions();
    } catch (err: any) {
      toast.dismiss();
      console.error('CSV upload failed:', err);
      toast.error(err.message || 'CSV upload failed');
    }
 
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
 
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
 
  const isEditing = editingId !== null && !isNaN(editingId);
 
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Code2 className="h-8 w-8 text-primary" />
          Coding Questions
        </h1>
        <div className="flex gap-3">
          <Button onClick={triggerFileInput} variant="secondary" className="gap-2">
            <Upload size={18} /> Upload CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus size={18} /> Add New Question
          </Button>
        </div>
      </div>
 
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleCsvUpload}
        className="hidden"
      />
 
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List size={20} /> Available Questions
          </CardTitle>
          <CardDescription>Manage existing coding problems</CardDescription>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <p className="text-center py-8 text-muted-foreground">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No questions found. Add your first question!
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.question_id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                        ID: {q.question_id}
                      </span>
                      <h3 className="font-medium">{q.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {q.question.substring(0, 120)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(q)}>
                      <Edit size={16} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(q.question_id)}
                    >
                      <Trash2 size={16} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
 
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-8 z-50 overflow-y-auto">
          <Card className="w-full max-w-4xl mx-4 border-t-4 border-primary relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={resetForm}>
              <X size={20} />
            </Button>
 
            <CardHeader>
              <CardTitle className="text-2xl">
                {isEditing ? 'Edit Coding Question' : 'Add New Coding Question'}
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update the existing problem' : 'Create a new problem for students to solve'}
              </CardDescription>
            </CardHeader>
 
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 pb-8">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Valid Parentheses"
                    value={form.title}
                    onChange={(e) => handleChange(e, 'title')}
                    required
                  />
                </div>
 
                <div className="grid gap-2">
                  <Label htmlFor="question">Question Statement *</Label>
                  <Textarea
                    id="question"
                    placeholder="Describe the problem clearly..."
                    rows={5}
                    value={form.question}
                    onChange={(e) => handleChange(e, 'question')}
                    required
                  />
                </div>
 
                <div className="grid gap-2">
                  <Label htmlFor="description">Detailed Description / Constraints</Label>
                  <Textarea
                    id="description"
                    placeholder="Constraints, notes, input format, etc."
                    rows={6}
                    value={form.description}
                    onChange={(e) => handleChange(e, 'description')}
                  />
                </div>
 
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label>Sample Input</Label>
                    <Textarea
                      placeholder="0 1 0 3 12\n0"
                      rows={4}
                      value={form.sample_inputs}
                      onChange={(e) => handleChange(e, 'sample_inputs')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sample Output</Label>
                    <Textarea
                      placeholder="1 3 12 0 0\n0"
                      rows={4}
                      value={form.sample_outputs}
                      onChange={(e) => handleChange(e, 'sample_outputs')}
                    />
                  </div>
                </div>
 
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Test Cases *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                      <Plus className="h-4 w-4 mr-2" /> Add Test Case
                    </Button>
                  </div>
 
                  {form.test_cases.map((tc, index) => (
                    <div
                      key={index}
                      className="grid md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/40 relative"
                    >
                      <div className="grid gap-2">
                        <Label>Input {index + 1}</Label>
                        <Textarea
                          placeholder="e.g. 0 1 0 3 12"
                          value={tc.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Expected Output {index + 1}</Label>
                        <Textarea
                          placeholder="e.g. 1 3 12 0 0"
                          value={tc.output}
                          onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                          rows={3}
                        />
                      </div>
                      {form.test_cases.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => removeTestCase(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
 
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Hints / Suggestions (optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSuggestion}>
                      <Plus className="h-4 w-4 mr-2" /> Add Hint
                    </Button>
                  </div>
 
                  {form.suggestion.map((hint, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Textarea
                        placeholder={`Hint ${index + 1}`}
                        value={hint}
                        onChange={(e) => handleSuggestionChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1 text-destructive"
                        onClick={() => removeSuggestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
 
                <div className="pt-6 flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 md:flex-none px-10"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
                  </Button>
 
                  <Button type="button" variant="outline" size="lg" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
 
export default CodingQuestions;
 