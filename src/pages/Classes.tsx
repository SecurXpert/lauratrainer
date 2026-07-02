import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface LiveClass {
  id: number;
  course_id: number;
  title: string;
  scheduled_at: string;     
  duration: number;        
  join_link: string;
  recorded_link?: string;
}

const API_BASE = 'http://192.168.0.122:10000'; 

export default function Classes() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal & Form state
  const [showModal, setShowModal] = useState(false);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [joinLink, setJoinLink] = useState('');
  const [recordedLink, setRecordedLink] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const getAccessToken = () => localStorage.getItem('access_token') || '';

  const loadClasses = async () => {
    setLoading(true);
    setError(null);

    const token = getAccessToken();
    if (!token) {
      setError('Please log in first');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get<LiveClass[]>(`${API_BASE}/trainer/live-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!courseId || !title.trim() || !scheduledAt || !duration || !joinLink.trim()) {
      setError('Please fill all required fields');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Please log in again');
      return;
    }

    setLoading(true);

    const payload = {
      course_id: Number(courseId),
      title: title.trim(),
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration: Number(duration),
      join_link: joinLink.trim(),
      recorded_link: recordedLink.trim() || undefined,
    };

    try {
      await axios.post(`${API_BASE}/trainer/live-classes`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Class scheduled successfully!');
      setShowModal(false); 
      resetForm();
      await loadClasses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId: number) => {
    if (!window.confirm(`Delete class #${classId}?`)) return;

    const token = getAccessToken();
    if (!token) {
      setError('Please log in again');
      return;
    }

    setLoading(true);

    try {
      await axios.delete(`${API_BASE}/trainer/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Class #${classId} deleted`);
      await loadClasses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCourseId('');
    setTitle('');
    setScheduledAt('');
    setDuration('');
    setJoinLink('');
    setRecordedLink('');
    setError(null);
  };

  const formatSafeDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Invalid date' : format(d, 'dd MMM yyyy • hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Classes Management</h1>
            <p className="text-gray-600 mt-1">Schedule and manage your upcoming live sessions</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition"
          >
            + Schedule New Class
          </button>
        </div>

       
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}

        
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Scheduled Live Classes</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 animate-pulse">Loading...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No classes scheduled yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cls.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cls.course_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cls.date}</td>
                     
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cls.duration} min</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={cls.join_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Join
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(cls.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Schedule New Live Class</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                      min="1"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Date & Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
                      min="5"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Link <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="url"
                      value={joinLink}
                      onChange={(e) => setJoinLink(e.target.value)}
                      required
                      placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recorded Link (optional)
                    </label>
                    <input
                      type="url"
                      value={recordedLink}
                      onChange={(e) => setRecordedLink(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-8 py-3 rounded-lg text-white font-medium min-w-[160px] flex items-center justify-center ${
                        loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? 'Scheduling...' : 'Schedule Class'}
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
}