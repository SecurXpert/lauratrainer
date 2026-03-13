import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
 
const API_BASE = 'http://192.168.0.122:10000';
 
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
interface Course {
  id: number;
  name?: string;
  title?: string;
}
 
interface Badge {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  icon_url?: string;
  rule?: any;
  additionalProp1?: any;
  is_active: boolean;
  created_at?: string;
}
 
interface Student {
  id: number;
  name?: string;
  email?: string;
  // add other fields your /trainer/profile endpoint actually returns
}
 
const Badges: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
 
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBadgeIdForEval, setSelectedBadgeIdForEval] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
 
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    rule: '{}',
    additionalProp1: '{}',
    is_active: true,
  });
 
  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get<Course[]>('/trainer/courses');
        setCourses(res.data || []);
      } catch (err: any) {
        console.error('Courses fetch failed:', err);
        setError('Failed to load courses');
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);
 
  // Load students (once)
// Load students (once)
useEffect(() => {
  const fetchStudents = async () => {
    try {
      const res = await api.get('/trainer/my-students');
 
      // ── Add defensive check ──
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        console.warn('Students endpoint did not return an array:', res.data);
        setStudents([]);
        toast.warning('Student list format is invalid');
      }
    } catch (err: any) {
      console.error('Students fetch failed:', err);
      setStudents([]);           // ← important: reset to empty array
      toast.error('Failed to load students');
    }
  };
  fetchStudents();
}, []);
 
  // Load badges when course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setBadges([]);
      return;
    }
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const res = await api.get<Badge[]>(`/courses/${selectedCourseId}/badges`);
        setBadges(res.data || []);
      } catch (err: any) {
        console.error('Badges fetch failed:', err);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [selectedCourseId]);
 
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
 
  const parseJsonSafely = (str: string, fieldName: string): any => {
    const trimmed = str.trim();
    if (!trimmed || trimmed === '{}') return {};
    try {
      return JSON.parse(trimmed);
    } catch (err: any) {
      toast.error(`Invalid JSON in "${fieldName}" field: ${err.message}`);
      throw err;
    }
  };
 
  // ───── Create Badge ─────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!selectedCourseId) {
      toast.error('Please select a course first');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Badge name is required');
      return;
    }
 
    let ruleObj: any;
    let additionalObj: any;
 
    try {
      ruleObj = parseJsonSafely(formData.rule, 'Rule');
      additionalObj = parseJsonSafely(formData.additionalProp1, 'Additional Properties');
    } catch {
      return;
    }
 
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      icon_url: formData.icon_url.trim() || undefined,
      rule: ruleObj,
      additionalProp1: additionalObj,
      is_active: formData.is_active,
    };
 
    try {
      setLoading(true);
      await api.post(`/courses/${selectedCourseId}/badges`, payload);
      toast.success('Badge created successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        icon_url: '',
        rule: '{}',
        additionalProp1: '{}',
        is_active: true,
      });
      // refresh badges
      setSelectedCourseId(selectedCourseId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create badge');
    } finally {
      setLoading(false);
    }
  };
 
  // ───── Evaluate Badge ─────
  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!selectedCourseId) {
      toast.error('No course selected');
      return;
    }
    if (!selectedBadgeIdForEval) {
      toast.error('Please select a badge');
      return;
    }
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }
 
    try {
      setLoading(true);
      const url = `/courses/${selectedCourseId}/badges/${selectedBadgeIdForEval}/evaluate/${selectedStudentId}`;
      await api.post(url);
      toast.success('Badge successfully evaluated for the student!');
      setIsEvaluateModalOpen(false);
      setSelectedStudentId('');
      setSelectedBadgeIdForEval('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to evaluate badge');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header + Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Course Badges</h1>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={loading || !selectedCourseId}
              className={`px-5 py-2.5 rounded-lg font-medium text-white transition ${
                !selectedCourseId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              + Create Badge
            </button>
 
            <button
              type="button"
              onClick={() => setIsEvaluateModalOpen(true)}
              disabled={loading || !selectedCourseId || badges.length === 0}
              className={`px-5 py-2.5 rounded-lg font-medium text-white transition ${
                !selectedCourseId || badges.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Evaluate for Student
            </button>
          </div>
        </div>
 
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
 
        {/* Course selection */}
        <div className="mb-10">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading || courses.length === 0}
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name || course.title || `Course #${course.id}`}
              </option>
            ))}
          </select>
        </div>
 
        {/* Badges Grid */}
        {loading && selectedCourseId && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading badges...</p>
          </div>
        )}
 
        {!loading && selectedCourseId && badges.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No badges found for this course yet.
          </div>
        )}
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {badge.icon_url ? (
                  <img
                    src={badge.icon_url}
                    alt={badge.name}
                    className="w-14 h-14 object-contain rounded-lg border bg-gray-50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Icon
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {badge.description || 'No description'}
                  </p>
                  <div className="mt-2 text-xs">
                    {badge.is_active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {/* ──────────────── CREATE BADGE MODAL ──────────────── */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Create New Badge</h2>
                <form onSubmit={handleCreateSubmit} className="space-y-5">
                  {/* ... your existing create form fields ... */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon URL</label>
                    <input
                      name="icon_url"
                      value={formData.icon_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                     Rule (JSON) – e.g. <code>{"{completed: true}"}</code> or <code>{"{}"}</code>
                    </label>
                    <textarea
                      name="rule"
                      value={formData.rule}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Additional Properties (JSON)
                    </label>
                    <textarea
                      name="additionalProp1"
                      value={formData.additionalProp1}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      name="is_active"
                      className="h-5 w-5"
                    />
                    <label htmlFor="is_active" className="ml-2">
                      Active
                    </label>
                  </div>
 
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-5 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
 
        {/* ──────────────── EVALUATE BADGE MODAL ──────────────── */}
    {isEvaluateModalOpen && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Evaluate Badge for Student</h2>
 
        <form onSubmit={handleEvaluateSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              disabled={loading || !Array.isArray(students) || students.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-60"
            >
              <option value="">Select student...</option>
 
              {Array.isArray(students) &&
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.email || s.username || `Student #${s.id}`}
                  </option>
                ))}
 
              {!Array.isArray(students) && (
                <option value="" disabled>
                  (student data unavailable)
                </option>
              )}
            </select>
          </div>
 
          <div>
            <label className="block text-sm font-medium mb-2">
              Badge to Evaluate <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBadgeIdForEval}
              onChange={(e) => setSelectedBadgeIdForEval(e.target.value)}
              required
              disabled={loading || badges.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:opacity-60"
            >
              <option value="">Select badge...</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (ID: {b.id})
                </option>
              ))}
            </select>
          </div>
 
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            Course:{' '}
            <strong>
              {courses.find((c) => String(c.id) === selectedCourseId)?.name ||
                `ID ${selectedCourseId}`}
            </strong>
          </div>
 
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setIsEvaluateModalOpen(false)}
              className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Evaluate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}  
      </div>
    </div>
  );
};
 
export default Badges;
 
 
 
 