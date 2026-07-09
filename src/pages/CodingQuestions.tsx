import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Question, QuestionForm } from '../components/CodingQuestions/CodingQuestionsTypes';
import CodingQuestionsHeader from '../components/CodingQuestions/CodingQuestionsHeader';
import CodingQuestionsList from '../components/CodingQuestions/CodingQuestionsList';
import CodingQuestionForm from '../components/CodingQuestions/CodingQuestionForm';

import { API_BASE_URL } from "./services/api/api";

const initialForm: QuestionForm = {
  title: '',
  question: '',
  description: '',
  sample_inputs: '',
  sample_outputs: '',
  test_cases: [{ input: '', output: '' }],
  suggestion: [''],
};

const API_BASE = `${API_BASE_URL}/compiler-questions`;

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
        } catch { }
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
        } catch { }
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
    <div className="container w-full px-4 pt-0 pb-8">
      <CodingQuestionsHeader
        triggerFileInput={triggerFileInput}
        setIsFormOpen={setIsFormOpen}
        fileInputRef={fileInputRef}
        handleCsvUpload={handleCsvUpload}
      />

      <CodingQuestionsList
        fetching={fetching}
        questions={questions}
        startEdit={startEdit}
        handleDelete={handleDelete}
      />

      <CodingQuestionForm
        isFormOpen={isFormOpen}
        isEditing={isEditing}
        form={form}
        loading={loading}
        handleChange={handleChange}
        handleTestCaseChange={handleTestCaseChange}
        addTestCase={addTestCase}
        removeTestCase={removeTestCase}
        addSuggestion={addSuggestion}
        removeSuggestion={removeSuggestion}
        handleSuggestionChange={handleSuggestionChange}
        resetForm={resetForm}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default CodingQuestions;
