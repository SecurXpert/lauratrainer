import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Plus, BookOpen, Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  file?: string;
}
export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW STATES
  const [quizIdInput, setQuizIdInput] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<number | null>(null);
  const [showBulkQuizFileModal, setShowBulkQuizFileModal] = useState(false);
  const [showBulkQuestionsModal, setShowBulkQuestionsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to view quizzes.');
      setLoading(false);
      return;
    }

    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get('/trainer/quizzes');
      setQuizzes(res.data || []);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Could not load quizzes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW FUNCTION – FETCH QUESTIONS BY QUIZ ID
  const fetchQuizQuestions = async () => {
    if (!quizIdInput || isNaN(Number(quizIdInput))) {
      toast.error('Please enter valid Quiz ID');
      return;
    }

    try {
      setQuestionsLoading(true);
      setQuestions([]);
      const res = await axiosInstance.get(
        `/trainer/quiz-view/${quizIdInput}`
      );
      setQuestions(res.data || []);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'Failed to fetch quiz questions';
      toast.error(msg);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleClearQuestions = () => {
  setQuizIdInput('');
  setQuestions([]);
};


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ================= NEW QUIZ VIEW INPUT ================= */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border mb-6">
  <h2 className="text-base sm:text-lg font-semibold mb-4">
    View Questions by Quiz ID
  </h2>

  <div className="flex flex-col sm:flex-row gap-3">

    {/* Input */}
    <input
      type="number"
      placeholder="Enter Quiz ID"
      value={quizIdInput}
      onChange={(e) => setQuizIdInput(e.target.value)}
      className="w-full sm:w-56 px-4 py-2.5 border border-gray-300 
                 rounded-lg focus:ring-2 focus:ring-indigo-500 
                 focus:border-indigo-500 outline-none"
    />

    {/* Get Questions Button */}
    <button
      onClick={fetchQuizQuestions}
      className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 
                 text-white rounded-lg hover:bg-indigo-700 
                 transition"
    >
      Get Questions
    </button>

    {/* Clear Button */}
    <button
      onClick={handleClearQuestions}
      className="w-full sm:w-auto px-5 py-2.5 bg-green-500 
                 text-white rounded-lg hover:bg-red-600 
                 transition"
    >
      Clear
    </button>

  </div>
</div>



        {/* ================= QUESTIONS DISPLAY ================= */}
        {questionsLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        )}

        {questions.length > 0 && (
          <div className="mb-8 space-y-4">
            <h3 className="text-xl font-semibold">
              Questions for Quiz #{quizIdInput}
            </h3>

            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-xl border shadow-sm"
              >
                <p className="font-medium mb-3">{q.question_text}</p>

                <ul className="text-sm space-y-1">
                  <li>A. {q.option_a}</li>
                  <li>B. {q.option_b}</li>
                  <li>C. {q.option_c}</li>
                  <li>D. {q.option_d}</li>
                </ul>

                {q.file_url && (
                  <div className="mt-3">
                    <a
                      href={q.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm underline"
                    >
                      View Attached File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= YOUR ORIGINAL CODE BELOW ================= */}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="mt-1 text-gray-600">
              Create and manage quizzes for your courses
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
              disabled={loading}
            >
              <Plus size={18} />
              Create Quiz
            </button>

            <button
              onClick={() => setShowBulkQuizFileModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm"
              disabled={loading}
            >
              <Upload size={18} />
              Bulk Quiz File
            </button>

            <button
              onClick={() => setShowBulkQuestionsModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm"
              disabled={loading}
            >
              <Upload size={18} />
              Bulk Questions
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <BookOpen className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No quizzes yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first quiz.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-100 relative flex items-center justify-center">
                  {quiz.file ? (
                    <img
                      src={quiz.file}
                      alt={quiz.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                          '<div class="text-gray-400">Image failed to load</div>';
                      }}
                    />
                  ) : (
                    <ImageIcon className="text-gray-300" size={48} />
                  )}
                </div>
                <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                   Quiz_id: {quiz.id}
                  </h3>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2 min-h-[3rem]">
                    {quiz.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Course ID: {quiz.course_id}
                    </span>
                    <button
                      onClick={() => setShowAddQuestionModal(quiz.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateQuizModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchQuizzes();
            }}
          />
        )}

        {showAddQuestionModal !== null && (
          <AddQuestionModal
            quizId={showAddQuestionModal}
            onClose={() => setShowAddQuestionModal(null)}
            onSuccess={() => {
              setShowAddQuestionModal(null);
              fetchQuizzes();
            }}
          />
        )}

        {/* New Bulk Quiz File Modal */}
        {showBulkQuizFileModal && (
          <BulkQuizFileModal
            onClose={() => setShowBulkQuizFileModal(false)}
            onSuccess={() => {
              setShowBulkQuizFileModal(false);
              fetchQuizzes(); // refresh list if needed
            }}
          />
        )}

        {/* New Bulk Questions Modal */}
        {showBulkQuestionsModal && (
          <BulkQuestionsModal
            onClose={() => setShowBulkQuestionsModal(false)}
            onSuccess={() => {
              setShowBulkQuestionsModal(false);
              fetchQuizzes();
            }}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Bulk Quiz File Upload Modal (POST /trainer/upload-file)
// ────────────────────────────────────────────────
interface BulkQuizFileModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function BulkQuizFileModal({ onClose, onSuccess }: BulkQuizFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axiosInstance.post('/trainer/upload-file', formData);
      toast.success('Quiz file uploaded successfully');
      onSuccess();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to upload quiz file';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-6">
  
  <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl
                  max-h-[95vh] overflow-y-auto shadow-2xl">

    {/* Header */}
    <div className="p-4 sm:p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
        Upload Quiz File
      </h2>
      <button onClick={onClose} disabled={submitting}>
        <X size={22} className="text-gray-500 hover:text-gray-800" />
      </button>
    </div>

    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">

      {/* Error */}
      {errorMsg && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Quiz File <span className="text-red-500">*</span>
        </label>

        <label className="cursor-pointer block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg 
                          p-5 sm:p-6 text-center hover:border-indigo-500 
                          hover:bg-indigo-50 transition">

            <Upload className="mx-auto text-gray-400 mb-2" size={30} />

            <p className="text-sm text-gray-600 break-words">
              {file ? file.name : 'Click to browse or drag & drop file here'}
            </p>
          </div>

          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xlsx,.csv,.txt"
          />
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 
                     rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || !file}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 
                     text-white rounded-lg hover:bg-indigo-700 
                     disabled:opacity-50 flex items-center 
                     justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Upload File
        </button>

      </div>

    </form>
  </div>
</div>

  );
}

// ────────────────────────────────────────────────
// Bulk Questions Upload Modal (POST /trainer/upload-questions)
// ────────────────────────────────────────────────
interface BulkQuestionsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function BulkQuestionsModal({ onClose, onSuccess }: BulkQuestionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState('');
  const [quizId, setQuizId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValid = file && courseId.trim() && quizId.trim() && !isNaN(Number(courseId)) && !isNaN(Number(quizId));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMsg('Please fill all required fields and select a file.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file!);

    try {
      await axiosInstance.post('/trainer/upload-questions', formData, {
        params: {
          course_id: Number(courseId),
          quiz_id: Number(quizId),
        },
      });
      toast.success('Bulk questions uploaded successfully');
      onSuccess();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to upload bulk questions';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-6">
  
  <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl 
                  max-h-[95vh] overflow-y-auto shadow-2xl">

    {/* Header */}
    <div className="p-4 sm:p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
        Upload Bulk Questions
      </h2>
      <button onClick={onClose} disabled={submitting}>
        <X size={22} className="text-gray-500 hover:text-gray-800" />
      </button>
    </div>

    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">

      {/* Error */}
      {errorMsg && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* Course ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course ID <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          min="1"
          placeholder="e.g. 20"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Quiz ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quiz ID <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          required
          min="1"
          placeholder="e.g. 5"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Questions File <span className="text-red-500">*</span>
        </label>

        <label className="cursor-pointer block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg 
                          p-5 sm:p-6 text-center hover:border-indigo-500 
                          hover:bg-indigo-50 transition">

            <Upload className="mx-auto text-gray-400 mb-2" size={30} />

            <p className="text-sm text-gray-600 break-words">
              {file ? file.name : 'Click to browse or drag & drop file here'}
            </p>
          </div>

          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".csv,.xlsx,.xls"
          />
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 
                     rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || !isValid}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 
                     text-white rounded-lg hover:bg-indigo-700 
                     disabled:opacity-50 flex items-center 
                     justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Upload Questions
        </button>
      </div>

    </form>
  </div>
</div>

  );
}

// ... (keep your existing CreateQuizModal and AddQuestionModal unchanged)

// ────────────────────────────────────────────────
// Create Quiz Modal (complete version)
// ────────────────────────────────────────────────
interface CreateQuizModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateQuizModal({ onClose, onSuccess }: CreateQuizModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFormValid =
    title.trim() &&
    description.trim() &&
    courseId.trim() &&
    !isNaN(Number(courseId)) &&
    Number(courseId) > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg('Please fill all required fields correctly.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('course_id', courseId.trim());
    if (file) {
      formData.append('file', file);
    }

    try {
      await axiosInstance.post('/trainer/quizzes', formData);
      toast.success('Quiz created successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Create quiz failed:', err);
      let msg = 'Failed to create quiz. Please try again.';
      if (err.response?.status === 422) {
        msg = err.response.data?.detail?.[0]?.msg || 'Invalid input data.';
      } else if (err.response?.status === 401) {
        msg = 'Session expired. Please log in again.';
        localStorage.removeItem('access_token');
        setTimeout(() => (window.location.href = '/login'), 1500);
      } else {
        msg = err.response?.data?.detail || err.response?.data?.message || msg;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Create New Quiz</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. JavaScript Basics"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Brief description of the quiz..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Course ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              min="1"
              placeholder="e.g. 20"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail (optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium">
                  Choose File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <span className="text-sm text-gray-600 truncate max-w-[180px]">
                  {file.name}
                </span>
              )}
            </div>

            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-32 rounded-lg object-contain border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Add Question Modal – FIXED to match backend /trainer/questions
// ────────────────────────────────────────────────
interface AddQuestionModalProps {
  quizId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function AddQuestionModal({
  quizId,
  onClose,
  onSuccess,
}: AddQuestionModalProps) {
  
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] =
    useState<'a' | 'b' | 'c' | 'd' | ''>('');
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValid =
    questionText &&
    optionA &&
    optionB &&
    optionC &&
    optionD &&
    correctOption;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setErrorMsg('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // ✅ CREATE FORM DATA
      const formData = new FormData();

      formData.append('quiz_id', String(quizId));
      formData.append('question_text', questionText);
      formData.append('option_a', optionA);
      formData.append('option_b', optionB);
      formData.append('option_c', optionC);
      formData.append('option_d', optionD);
      formData.append('correct_option', correctOption);

      // Optional file
      if (file) {
        formData.append('file', file);
      }

      const response = await axiosInstance.post(
        '/trainer/questions',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Question added successfully!');
      onSuccess();
    } catch (err: any) {
      console.error(err);

      let msg = 'Failed to add question';

      if (err.response?.status === 422) {
        msg =
          err.response.data?.detail?.[0]?.msg ||
          'Validation error. Check fields.';
      }

      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };


  return (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-2xl font-semibold text-gray-900">
          Add Question to Quiz #{quizId}
        </h2>
        <button
          onClick={onClose}
          disabled={submitting}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Error Message */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            rows={3}
            placeholder="Enter the question text here..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
          />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[ 
            { label: "Option A", value: optionA, setter: setOptionA },
            { label: "Option B", value: optionB, setter: setOptionB },
            { label: "Option C", value: optionC, setter: setOptionC },
            { label: "Option D", value: optionD, setter: setOptionD }
          ].map((opt, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {opt.label} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={opt.value}
                onChange={(e) => opt.setter(e.target.value)}
                required
                placeholder={opt.label}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Correct Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Option <span className="text-red-500">*</span>
          </label>
          <select
            value={correctOption}
            onChange={(e) =>
              setCorrectOption(
                e.target.value as 'a' | 'b' | 'c' | 'd' | ''
              )
            }
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Select correct answer</option>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
            <option value="d">D</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Media (Optional)
          </label>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
              <span className="text-sm text-gray-600">
                {file ? file.name : "Click to upload image / video / pdf"}
              </span>
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {submitting && (
              <Loader2 size={18} className="animate-spin" />
            )}
            Add Question
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

