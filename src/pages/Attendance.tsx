import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GraduationCap, Plus, Edit, Trash2, Search, ChevronDown, Eye, Clock, Calendar, Download, User, Save, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Student {
  id: number;
  student_id: number;
  student_name: string;
  course: string;
  check_in_time: string;
  check_out_time: string;
  status: string;
}

interface AttendanceRecord {
  id: number;
  date: string;
  check_in: string;
  check_out: string | null;
  duration_hours: number | string;
  student_id: number;
  student_name: string;
  check_in_time?: string;
  check_out_time?: string;
  status?: string;
}

const API_BASE = 'https://lauratek.in:8000';
const VIEW_ENDPOINT = '/attendance/instructor/view-attendance';
const ADD_ENDPOINT = '/attendance/instructor/add';
const EDIT_ENDPOINT = '/attendance/instructor/edit';
const DELETE_ENDPOINT = '/attendance/instructor/delete';

const Attendance = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get('course_id') || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [allStudents, setAllStudents] = useState<any[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get('/trainer/courses');
      const data = Array.isArray(res.data) ? res.data : [];
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axiosInstance.get('/trainer/my-students');
      const data = Array.isArray(res.data) ? res.data : [];
      setAllStudents(data);
    } catch (err) {
      console.error('Failed to load all students:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchAllStudents();
  }, []);

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [listPage, setListPage] = useState(1);
  const studentsPerPage = 10;

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: courseId,
    check_in_time: '',
    check_out_time: '',
  });

  const [formDate, setFormDate] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');

  const token = localStorage.getItem('access_token');

  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const fetchStudents = async () => {
    if (!token) {
      toast.error('No token found. Please login.');
      navigate('/login');
      return;
    }

    const defaultFrom = () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split('T')[0];
    };
    const defaultTo = () => new Date().toISOString().split('T')[0];

    setLoading(true);
    try {
      let data: any[] = [];
      if (!courseId) {
        if (courses.length > 0) {
          const fetchPromises = courses.map(c =>
            axiosInstance.get(VIEW_ENDPOINT, {
              params: {
                course_id: c.id,
                from_date: fromDate || defaultFrom(),
                to_date: toDate || defaultTo()
              }
            }).catch(err => {
              console.error(`Failed to load attendance for course ${c.id}:`, err);
              return { data: [] };
            })
          );
          const responses = await Promise.all(fetchPromises);
          responses.forEach(res => {
            if (res && Array.isArray(res.data)) {
              data = [...data, ...res.data];
            }
          });
        }
      } else {
        const res = await axiosInstance.get(VIEW_ENDPOINT, {
          params: {
            course_id: courseId,
            from_date: fromDate || defaultFrom(),
            to_date: toDate || defaultTo()
          }
        });
        data = res.data || [];
      }

      const sortedData = [...data].sort((a: any, b: any) => {
        const dateA = a.check_in_time || a.date;
        const dateB = b.check_in_time || b.date;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const studentMap = new Map<number, Student>();
      sortedData.forEach((r: any) => {
        const sid = r.student_id;
        if (sid && !studentMap.has(sid)) {
          let status = 'Absent';
          if (r.status) {
            status = r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase();
          } else if (r.check_in_time) {
            const checkInDate = new Date(r.check_in_time);
            if (checkInDate.getHours() > 9 || (checkInDate.getHours() === 9 && checkInDate.getMinutes() > 15)) {
              status = 'Late';
            } else {
              status = 'Present';
            }
          }

          const formatTime = (isoString?: string) => {
            if (!isoString) return '-';
            try {
              return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            } catch {
              return '-';
            }
          };

          studentMap.set(sid, {
            id: sid,
            student_id: sid,
            student_name: r.student_name || 'Unknown',
            course: r.course_name || 'Web Development',
            check_in_time: formatTime(r.check_in_time),
            check_out_time: formatTime(r.check_out_time),
            status: status,
          });
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (err: any) {
      console.error('Fetch students failed:', err.response?.data || err.message);
      toast.error('Failed to load students');
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('trainer_profile');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hoursVal: any) => {
    if (hoursVal == null || isNaN(Number(hoursVal)) || Number(hoursVal) <= 0) return '-';
    const totalMinutes = Math.round(Number(hoursVal) * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const handleExport = () => {
    if (attendanceRecords.length === 0) return toast.error('No records to export');
    const headers = ['Date', 'Check-in Time', 'Check-out Time', 'Duration (Hours)', 'Attendance ID'];
    const rows = attendanceRecords.map(r => [
      r.date,
      r.check_in,
      r.check_out,
      r.duration_hours,
      r.id
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedStudent?.student_name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAttendanceDetail = async (studentId: number, studentName: string, preservePage = false) => {
    const defaultFrom = () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split('T')[0];
    };
    const defaultTo = () => new Date().toISOString().split('T')[0];

    setLoading(true);
    try {
      let data: any[] = [];
      if (!courseId) {
        if (courses.length > 0) {
          const fetchPromises = courses.map(c =>
            axiosInstance.get(VIEW_ENDPOINT, {
              params: {
                course_id: c.id,
                from_date: fromDate || defaultFrom(),
                to_date: toDate || defaultTo()
              }
            }).catch(() => ({ data: [] }))
          );
          const responses = await Promise.all(fetchPromises);
          responses.forEach(res => {
            if (res && Array.isArray(res.data)) {
              data = [...data, ...res.data];
            }
          });
        }
      } else {
        const res = await axiosInstance.get(VIEW_ENDPOINT, {
          params: {
            course_id: courseId,
            from_date: fromDate || defaultFrom(),
            to_date: toDate || defaultTo()
          }
        });
        data = res.data || [];
      }
      const records = data
        .filter((r: any) => r.student_id === studentId)
        .map((r: any) => {
          const dateObj = new Date(r.date || r.attended_at || r.check_in_time || '');
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          const dateStr = isNaN(dateObj.getTime()) ? '-' : `${yyyy}-${mm}-${dd}`;

          const formatTime = (isoString?: string) => {
            if (!isoString) return '-';
            try {
              return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            } catch {
              return '-';
            }
          };

          return {
            id: r.id || 0,
            student_id: r.student_id,
            student_name: r.student_name || studentName,
            date: dateStr,
            check_in: formatTime(r.check_in_time),
            check_out: formatTime(r.check_out_time),
            duration_hours: r.duration_hours != null ? Number(r.duration_hours) : 0,
            check_in_time: r.check_in_time || '',
            check_out_time: r.check_out_time || '',
            status: r.status || '',
          };
        });

      records.sort((a, b) => {
        const dateA = a.check_in_time || a.date;
        const dateB = b.check_in_time || b.date;
        if (!dateA || dateA === '-') return 1;
        if (!dateB || dateB === '-') return -1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setAttendanceRecords(records);
      if (!preservePage) {
        setCurrentPage(1);
      } else {
        const totalRecords = records.length;
        const totalPages = Math.ceil(totalRecords / itemsPerPage);
        setCurrentPage(prev => {
          if (prev > totalPages) return Math.max(totalPages, 1);
          return prev;
        });
      }
      setSelectedStudent({
        id: studentId,
        student_id: studentId,
        student_name: studentName,
        course: '',
        check_in_time: '',
        check_out_time: '',
        status: ''
      });
      setViewMode('detail');
    } catch (err: any) {
      toast.error('Failed to load details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setSearchParams({});
  };

  const getIsoString = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return undefined;
    try {
      const d = new Date(`${dateStr}T${timeStr}`);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch {
      return undefined;
    }
  };

  const handleAdd = async () => {
    if (!courseId) return toast.error('Please select a course from the dropdown first');
    if (!formData.student_id || !formDate || !formCheckIn) return toast.error('Required fields missing');

    const checkInIso = getIsoString(formDate, formCheckIn);
    const checkOutIso = formCheckOut ? getIsoString(formDate, formCheckOut) : undefined;

    if (!checkInIso) return toast.error('Invalid check-in date or time');

    try {
      await axiosInstance.post(ADD_ENDPOINT, {
        student_id: Number(formData.student_id),
        course_id: Number(courseId),
        check_in_time: checkInIso,
        check_out_time: checkOutIso,
      });
      toast.success('Added');
      setShowAddForm(false);
      resetForm();
      if (selectedStudent) {
        fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name);
      } else {
        fetchStudents();
      }
    } catch (err: any) {
      console.error('Add failed:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Add failed');
    }
  };

  const handleEdit = async () => {
    if (!courseId) return toast.error('Please select a course from the dropdown first');
    if (!editingRecord || !formDate || !formCheckIn) return toast.error('Required fields missing');

    const checkInIso = getIsoString(formDate, formCheckIn);
    const checkOutIso = formCheckOut ? getIsoString(formDate, formCheckOut) : undefined;

    if (!checkInIso) return toast.error('Invalid check-in date or time');

    try {
      await axiosInstance.put(`${EDIT_ENDPOINT}/${editingRecord.id}`, {
        student_id: Number(formData.student_id || editingRecord.student_id),
        course_id: Number(courseId),
        check_in_time: checkInIso,
        check_out_time: checkOutIso,
      });
      toast.success('Updated');
      setEditingRecord(null);
      resetForm();
      if (selectedStudent) {
        await fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name, true);
      }
      await fetchStudents();
    } catch (err: any) {
      console.error('Edit failed:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!id || id === 0) {
      toast.error('Cannot delete this record as it has no attendance ID (e.g. absent days without check-in).');
      return;
    }
    if (!confirm('Delete this record?')) return;

    try {
      await axiosInstance.delete(`${DELETE_ENDPOINT}/${id}`);
      toast.success('Deleted');
      if (selectedStudent) {
        await fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name, true);
      }
      await fetchStudents();
    } catch (err: any) {
      console.error('Delete failed:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const startEdit = (record: AttendanceRecord) => {
    const parseDateTime = (isoStr?: string) => {
      if (!isoStr) return { date: '', time: '' };
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { date: '', time: '' };
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return {
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hrs}:${mins}`
      };
    };

    const parsedIn = parseDateTime(record.check_in_time);
    const parsedOut = parseDateTime(record.check_out_time);

    setFormDate(parsedIn.date || parsedOut.date || new Date().toISOString().split('T')[0]);
    setFormCheckIn(parsedIn.time);
    setFormCheckOut(parsedOut.time);

    setEditingRecord(record);
    setFormData({
      student_id: record.student_id.toString(),
      course_id: courseId,
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      course_id: courseId,
      check_in_time: '',
      check_out_time: '',
    });
    setFormDate('');
    setFormCheckIn('');
    setFormCheckOut('');
    setShowAddForm(false);
    setEditingRecord(null);
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId, fromDate, toDate, courses.length]);

  useEffect(() => {
    setListPage(1);
  }, [searchTerm, courseId]);

  const handleBack = () => {
    setViewMode('list');
    setSelectedStudent(null);
    setAttendanceRecords([]);
    resetForm();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleaned = val.replace(/\D/g, '');
    setFormData({ ...formData, student_id: cleaned });
  };

  const getCalculatedDuration = () => {
    if (!formCheckIn || !formCheckOut) return '';
    const [inH, inM] = formCheckIn.split(':').map(Number);
    const [outH, outM] = formCheckOut.split(':').map(Number);

    let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMins < 0) return 'Invalid time range';

    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const durationText = getCalculatedDuration();

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center p-4">Please login first</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-2 md:p-3 from-gray-50 to-gray-100">
      <div className="w-full">
        {!(showAddForm || editingRecord) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Student Attendance</h1>
                <p className="text-base text-gray-500">Create a new attendance entry for a student</p>
              </div>
            </div>

            {viewMode === 'list' && (
              <Button
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="gap-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white border-none shadow-[0_4px_12px_rgba(99,102,241,0.15)] rounded-2xl h-10 px-4 font-semibold transition-all w-full sm:w-auto justify-center"
              >
                <Plus size={16} /> Add Attendance
              </Button>
            )}
          </div>
        )}

        {viewMode === 'list' && !showAddForm && !editingRecord && (
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
              {/* Search Input */}
              <div className="flex flex-col gap-1.5 w-full xl:col-span-2">
                <label className="text-sm font-semibold text-slate-800">Search Student</label>
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by Name..."
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleaned = val.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
                      setSearchTerm(cleaned);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-800">Start Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm cursor-pointer ${
                    !fromDate ? 'text-slate-400/80' : 'text-slate-800'
                  }`}
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-800">End Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm cursor-pointer ${
                    !toDate ? 'text-slate-400/80' : 'text-slate-800'
                  }`}
                />
              </div>

              {/* Select Course */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-800">Select Course</label>
                <div className="relative w-full">
                  <select
                    value={courseId}
                    onChange={(e) => setSearchParams(e.target.value ? { course_id: e.target.value } : {})}
                    className={`w-full pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm appearance-none cursor-pointer ${
                      !courseId ? 'text-slate-400/80' : 'text-slate-800'
                    }`}
                  >
                    <option value="" className="text-slate-400 bg-white">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id} className="text-slate-800 bg-white">
                        {course.title ? `${course.title} (ID: ${course.id})` : `Course ID: ${course.id}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Reset Button */}
              <div className="w-full sm:col-span-2 lg:col-span-4 xl:col-span-1">
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {(showAddForm || editingRecord) && (
          <div className="animate-fade-in mb-8">
            {/* Back Button */}
            <button
              onClick={resetForm}
              className="group flex items-center gap-2 text-slate-500 hover:text-[#3b82f6] text-sm font-semibold transition-all mb-6 px-3 py-1.5 rounded-lg hover:bg-blue-50 -ml-3"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Attendance
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900">
                {editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}
              </h1>
              <p className="text-slate-500 mt-1">
                {editingRecord ? 'Modify an existing attendance entry' : 'Create a new attendance entry for a student'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form (Col Span 2) */}
              <div className="lg:col-span-2">
                <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-8">
                  <CardContent className="p-0 space-y-6">
                    {/* Course */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <GraduationCap className="w-4 h-4 text-[#8b5cf6]" />
                        Select Course *
                      </label>
                      <div className="relative">
                        <select
                          value={courseId}
                          onChange={(e) => setSearchParams({ course_id: e.target.value })}
                          disabled={!!editingRecord}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Course</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id.toString()}>
                              {c.title ? `${c.title} (ID: ${c.id})` : `Course ID: ${c.id}`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <User className="w-4 h-4 text-[#8b5cf6]" />
                        Select Student *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.student_id}
                          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                          disabled={!!editingRecord}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Student</option>
                          {allStudents.map((s) => (
                            <option key={s.id} value={s.id.toString()}>
                              {s.name} (ID: {s.id})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 text-[#8b5cf6]" />
                        Date *
                      </label>
                      <input
                        type="date"
                        max={todayStr}
                        value={formDate}
                        onChange={e => setFormDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all cursor-pointer"
                      />
                      <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        Cannot select future dates
                      </p>
                    </div>

                    {/* Check-in & Check-out Times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                          <Clock className="w-4 h-4 text-[#10B981]" />
                          Check-in Time *
                        </label>
                        <input
                          type="time"
                          value={formCheckIn}
                          onChange={e => setFormCheckIn(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                          <Clock className="w-4 h-4 text-[#EF4444]" />
                          Check-out Time *
                        </label>
                        <input
                          type="time"
                          value={formCheckOut}
                          onChange={e => setFormCheckOut(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Clock className="w-4 h-4 text-[#8b5cf6]" />
                        Duration (Auto-calculated)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={durationText || 'Duration will be calculated automatically'}
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-slate-500 text-sm focus:outline-none"
                      />
                      <p className="text-xs text-slate-400 mt-2">Based on check-in and check-out times</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                      <Button
                        onClick={editingRecord ? handleEdit : handleAdd}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(99,102,241,0.15)] flex items-center justify-center gap-2 border-none h-12"
                      >
                        <Save className="w-4 h-4" />
                        Save Attendance
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1 border border-gray-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 h-12"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar (Col Span 1) */}
              <div className="space-y-6">
                {/* Quick Tips */}
                <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-6">
                  <div className="flex items-center gap-2 mb-4 text-violet-600">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold text-slate-800 text-base">Quick Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5 text-sm text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      Select the student from the dropdown to view their details
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      Date cannot be in the future
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      Duration is calculated automatically from times
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      Status is auto-detected but can be changed manually
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      Check-out time must be after check-in time
                    </li>
                  </ul>
                </Card>

                {/* Standard Times */}
                <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-6">
                  <h3 className="font-bold text-slate-800 text-base mb-4">Standard Times</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                      <span className="text-sm font-semibold text-emerald-800">Check-in</span>
                      <span className="text-sm font-bold text-emerald-700">9:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                      <span className="text-sm font-semibold text-rose-800">Check-out</span>
                      <span className="text-sm font-bold text-rose-700">5:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                      <span className="text-sm font-semibold text-amber-800">Late After</span>
                      <span className="text-sm font-bold text-amber-700">9:15 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                      <span className="text-sm font-semibold text-blue-800">Expected Duration</span>
                      <span className="text-sm font-bold text-blue-700">8 hours</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && !showAddForm && !editingRecord && (
          <div>
            {loading ? (
              <p className="text-center py-10">Loading...</p>
            ) : students.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No students found</p>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {students
                    .filter(s =>
                      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.student_id.toString().includes(searchTerm)
                    )
                    .slice((listPage - 1) * studentsPerPage, listPage * studentsPerPage)
                    .map(s => {
                      const initials = s.student_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();
                      return (
                        <div
                          key={s.student_id}
                          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-[0_4px_25px_-2px_rgba(0,0,0,0.08)]"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white flex items-center justify-center font-semibold text-[16px] shadow-sm shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 text-[16px] truncate" title={s.student_name}>{s.student_name}</h3>
                              <p className="text-sm text-slate-400 font-medium mt-0.5">Student Id: {s.student_id}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => fetchAttendanceDetail(s.student_id, s.student_name)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(99,102,241,0.15)] w-full sm:w-auto"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Main List Pagination */}
                {Math.ceil(students.filter(s =>
                  s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.student_id.toString().includes(searchTerm)
                ).length / studentsPerPage) > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-gray-100 bg-white rounded-2xl shadow-sm">
                      <span className="text-sm text-slate-500 font-medium">
                        Showing {((listPage - 1) * studentsPerPage) + 1} to {Math.min(listPage * studentsPerPage, students.filter(s =>
                          s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.student_id.toString().includes(searchTerm)
                        ).length)} of {students.filter(s =>
                          s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.student_id.toString().includes(searchTerm)
                        ).length} students
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setListPage(prev => Math.max(prev - 1, 1))}
                          disabled={listPage === 1}
                          className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold"
                        >
                          Previous
                        </Button>

                        {Array.from({
                          length: Math.ceil(students.filter(s =>
                            s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.student_id.toString().includes(searchTerm)
                          ).length / studentsPerPage)
                        }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => setListPage(page)}
                            className={`w-9 h-9 p-0 flex items-center justify-center rounded-xl font-bold transition-all ${listPage === page
                              ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white border-transparent shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 border-gray-200'
                              }`}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setListPage(prev => Math.min(prev + 1, Math.ceil(students.filter(s =>
                            s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.student_id.toString().includes(searchTerm)
                          ).length / studentsPerPage)))}
                          disabled={listPage === Math.ceil(students.filter(s =>
                            s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.student_id.toString().includes(searchTerm)
                          ).length / studentsPerPage)}
                          className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'detail' && selectedStudent && (() => {
          const totalRecords = attendanceRecords.length;
          const totalPages = Math.ceil(totalRecords / itemsPerPage);
          const indexOfLastRecord = currentPage * itemsPerPage;
          const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
          const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);

          return (
            <div>
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 text-slate-500 hover:text-[#3b82f6] text-sm font-semibold transition-all mb-6 px-3 py-1.5 rounded-lg hover:bg-blue-50 -ml-3"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Attendance
              </button>

              <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-50">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Detailed Attendance Records</h2>
                    <p className="text-sm text-slate-500 mt-1">Complete history of check-ins and check-outs</p>
                  </div>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="flex items-center gap-2 rounded-xl border-gray-200 text-slate-600 hover:bg-slate-50 font-semibold px-4 py-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <p className="text-center py-10">Loading...</p>
                  ) : attendanceRecords.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground">No records found</p>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow
                            className="border-b border-slate-100"
                            style={{ background: 'linear-gradient(90deg, #F9FAFB 0%, #F3F4F6 100%)' }}
                          >
                            <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                            <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Status</TableHead>
                            <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Check-in Time</TableHead>
                            <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Check-out Time</TableHead>
                            <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Duration</TableHead>
                            {/* <TableHead className="font-bold text-slate-800 text-[13px] py-4 px-6 uppercase tracking-wider whitespace-nowrap">Attendance ID</TableHead> */}
                            <TableHead className="font-bold text-[#4A5565] text-[13px] py-4 px-6 uppercase tracking-wider text-right w-24 whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRecords.map(r => (
                            <TableRow key={r.id || `${r.student_id}_${r.date}`} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                              <TableCell className="py-4 px-6 font-semibold text-[#101828] whitespace-nowrap">
                                <span className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#99A1AF]" />
                                  {r.date}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-6 whitespace-nowrap">
                                {r.status ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.status.toLowerCase() === 'present'
                                    ? 'bg-green-50 text-green-700 border border-green-150'
                                    : r.status.toLowerCase() === 'absent'
                                      ? 'bg-red-50 text-red-700 border border-red-150'
                                      : 'bg-amber-50 text-amber-700 border border-amber-150'
                                    }`}>
                                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6 font-semibold text-[#364153] whitespace-nowrap">
                                {r.check_in && r.check_in !== '-' ? (
                                  <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#10B981]" />
                                    {r.check_in}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6 font-semibold text-[#364153] whitespace-nowrap">
                                {r.check_out && r.check_out !== '-' ? (
                                  <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#EF4444]" />
                                    {r.check_out}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6 whitespace-nowrap">
                                {r.duration_hours && Number(r.duration_hours) > 0 ? (
                                  <div className="flex flex-col gap-1.5 w-28">
                                    <span className="font-bold text-[#10B981] text-sm">
                                      {formatDuration(r.duration_hours)}
                                    </span>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#10B981] rounded-full"
                                        style={{ width: `${Math.min((Number(r.duration_hours) / 8) * 100, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              {/* <TableCell className="py-4 px-6 font-semibold text-slate-700 whitespace-nowrap">{r.id || '-'}</TableCell> */}
                              <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                                {r.id ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                    onClick={() => handleDelete(r.id)}
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </Button>
                                ) : (
                                  <span className="text-slate-350">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center p-6 border-t border-slate-50 bg-slate-50/20">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold"
                        >
                          Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 p-0 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page
                              ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white border-transparent shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 border-gray-200'
                              }`}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Attendance;






