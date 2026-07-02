import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Video,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronDown,
  Clock3,
  CalendarCheck,
  BarChart3,
  Timer,
  CheckCircle2,
  Link,
  BookOpen,
  TrendingUp,
  Hourglass,
} from 'lucide-react';
import { FaCalendarDays } from "react-icons/fa6";
import { BsFillCalendar2Fill } from "react-icons/bs";

interface LiveClass {
  id: number;
  course_id: number;
  title: string;
  scheduled_at: string;
  duration: number;
  join_link: string;
  recorded_link?: string;
}

function normalizeLiveClass(raw: Record<string, unknown>, courses: any[] = []): LiveClass {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      course_id: 0,
      title: 'Untitled Class',
      scheduled_at: '',
      duration: 0,
      join_link: '',
    };
  }
  let course_id = NaN;

  // 1. Check all possible ID field names
  const courseRaw = raw.course_id ?? raw.courseId ?? raw.course_id_id;
  if (courseRaw !== undefined && courseRaw !== null && courseRaw !== '') {
    course_id = Number(courseRaw);
  }

  // 2. Check nested object structures
  if (isNaN(course_id) && raw.course && typeof raw.course === 'object') {
    const nestedId = (raw.course as any).id ?? (raw.course as any).course_id ?? (raw.course as any).courseId;
    if (nestedId !== undefined && nestedId !== null && nestedId !== '') {
      course_id = Number(nestedId);
    }
  }

  // 3. Check direct fields that might be course name/title strings or ID numbers
  if (isNaN(course_id)) {
    const possibleStr = String(raw.course ?? raw.course_title ?? raw.course_name ?? raw.course_code ?? '').trim();
    if (possibleStr) {
      const parsedNum = Number(possibleStr);
      if (!isNaN(parsedNum)) {
        course_id = parsedNum;
      } else {
        // Look up by matching title/name/code
        const matched = Array.isArray(courses) ? courses.find(
          c => {
            if (!c) return false;
            const cTitle = String(c.title || c.name || '').toLowerCase();
            const cCode = String(c.code || '').toLowerCase();
            const search = possibleStr.toLowerCase();
            return cTitle === search || cCode === search || cTitle.includes(search) || search.includes(cTitle);
          }
        ) : undefined;
        if (matched) {
          course_id = Number(matched.id);
        }
      }
    }
  }

  return {
    id: Number(raw.id),
    course_id: Number.isFinite(course_id) ? course_id : 0,
    title: String(raw.title ?? ''),
    scheduled_at: String(
      raw.date ??
      raw.scheduled_at ??
      raw.scheduledAt ??
      raw.schedule_at ??
      raw.start_time ??
      raw.startTime ??
      raw.start ??
      ''
    ),
    duration: Number(raw.duration ?? 0),
    join_link: String(raw.join_link ?? raw.joinLink ?? ''),
    recorded_link: (() => {
      const rec = raw.recorded_link ?? raw.recordedLink;
      if (rec == null || rec === '') return undefined;
      return String(rec);
    })(),
  };
}

const API_BASE = 'https://lauratek.in:8000';

export default function Classes() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  // Modal & Form state
  const [showModal, setShowModal] = useState(false);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [joinLink, setJoinLink] = useState('');
  const [recordedLink, setRecordedLink] = useState('');

  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, [showModal]); // Recalculate only when the modal opens

  const maxDateTime = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setMinutes(nextWeek.getMinutes() - nextWeek.getTimezoneOffset());
    return nextWeek.toISOString().slice(0, 16);
  }, [showModal]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [sortBy, setSortBy] = useState('recent');

  // Reset page when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, sortBy]);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteSuccessPopup, setDeleteSuccessPopup] = useState<{
    courseName: string;
    courseId: number;
  } | null>(null);
  const deletePopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scheduleSuccessPopup, setScheduleSuccessPopup] = useState<{
    title: string;
    courseId: number;
  } | null>(null);
  const schedulePopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [copySuccessPopup, setCopySuccessPopup] = useState<string | null>(null);
  const copyPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      const courses = await fetchCourses();
      await loadClasses(courses);
    };
    init();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return [];
    try {
      const res = await axios.get(`${API_BASE}/trainer/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawData = res.data;
      let coursesData: any[] = [];
      if (Array.isArray(rawData)) {
        coursesData = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.courses)) {
          coursesData = rawData.courses;
        } else if (Array.isArray(rawData.data)) {
          coursesData = rawData.data;
        } else if (Array.isArray(rawData.items)) {
          coursesData = rawData.items;
        } else if (Array.isArray(rawData.coursesData)) {
          coursesData = rawData.coursesData;
        }
      }
      setAvailableCourses(coursesData);
      return coursesData;
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      return [];
    }
  };

  useEffect(() => {
    return () => {
      if (deletePopupTimerRef.current) {
        clearTimeout(deletePopupTimerRef.current);
      }
      if (schedulePopupTimerRef.current) {
        clearTimeout(schedulePopupTimerRef.current);
      }
      if (copyPopupTimerRef.current) {
        clearTimeout(copyPopupTimerRef.current);
      }
    };
  }, []);

  const getAccessToken = () => localStorage.getItem('access_token') || '';

  const handleCopyLink = (linkText: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = linkText;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      if (copyPopupTimerRef.current) {
        clearTimeout(copyPopupTimerRef.current);
      }
      setCopySuccessPopup(linkText);
      copyPopupTimerRef.current = setTimeout(() => {
        setCopySuccessPopup(null);
        copyPopupTimerRef.current = null;
      }, 1500);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  const loadClasses = async (coursesList?: any[], silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    const token = getAccessToken();
    if (!token) {
      setError('Please log in first');
      if (!silent) {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await axios.get<any>(`${API_BASE}/trainer/live-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawData = res.data;
      let data: any[] = [];
      if (Array.isArray(rawData)) {
        data = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.data)) {
          data = rawData.data;
        } else if (Array.isArray(rawData.items)) {
          data = rawData.items;
        } else if (Array.isArray(rawData.live_classes)) {
          data = rawData.live_classes;
        } else if (Array.isArray(rawData.liveClasses)) {
          data = rawData.liveClasses;
        } else if (Array.isArray(rawData.classes)) {
          data = rawData.classes;
        } else if (Array.isArray(rawData.meetings)) {
          data = rawData.meetings;
        }
      }
      const currentCourses = coursesList || availableCourses;

      setClasses(
        data.map((row: any) =>
          normalizeLiveClass(row as unknown as Record<string, unknown>, currentCourses),
        ).reverse(),
      );
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to load classes';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseId || !title.trim() || !scheduledAt || !duration || !joinLink.trim()) {
      setError('Please fill all required fields');
      return;
    }

    const token = getAccessToken();
    if (duration < 5) {
      setError('Duration must be at least 5 minutes');
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const now = new Date();
    if (selectedDate < now) {
      setError('You cannot schedule a class in the past. Please select a present or future time.');
      return;
    }

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

      setShowModal(false);
      resetForm();
      await loadClasses(undefined, true);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  const showScheduleSuccessPopup = (classTitle: string, classCourseId: number) => {
    if (schedulePopupTimerRef.current) {
      clearTimeout(schedulePopupTimerRef.current);
    }
    setScheduleSuccessPopup({ title: classTitle, courseId: classCourseId });
    schedulePopupTimerRef.current = setTimeout(() => {
      setScheduleSuccessPopup(null);
      schedulePopupTimerRef.current = null;
    }, 3000);
  };

  const showDeleteSuccessPopup = (courseName: string, courseId: number) => {
    if (deletePopupTimerRef.current) {
      clearTimeout(deletePopupTimerRef.current);
    }
    setDeleteSuccessPopup({ courseName, courseId });
    deletePopupTimerRef.current = setTimeout(() => {
      setDeleteSuccessPopup(null);
      deletePopupTimerRef.current = null;
    }, 3000);
  };

  const handleDelete = async (cls: LiveClass) => {
    const token = getAccessToken();
    if (!token) {
      setError('Please log in again');
      return;
    }

    setDeletingId(cls.id);
    setError(null);

    // Optimistically update classes by removing the deleted item
    const previousClasses = classes;
    setClasses(prev => prev.filter(c => c.id !== cls.id));

    try {
      await axios.delete(`${API_BASE}/trainer/live-classes/${cls.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadClasses(undefined, true);
    } catch (err: any) {
      setClasses(previousClasses);
      const msg = err.response?.data?.detail || 'Failed to delete';
      setError(msg);
      toast.error(msg);
    } finally {
      setDeletingId(null);
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const parseScheduledDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    let cleanStr = dateStr.trim();
    if (cleanStr.includes(' ')) {
      cleanStr = cleanStr.replace(' ', 'T');
    }
    if (!cleanStr.endsWith('Z') && !/\+\d{2}:?\d{2}$/.test(cleanStr) && !/-\d{2}:?\d{2}$/.test(cleanStr)) {
      cleanStr = cleanStr + 'Z';
    }
    const d = new Date(cleanStr);
    return isNaN(d.getTime()) ? new Date(dateStr) : d;
  };

  const formatSafeDate = (dateStr?: string) => {
    if (!dateStr || dateStr.trim() === '' || dateStr === 'undefined' || dateStr === 'null') return 'Not scheduled';
    try {
      const d = parseScheduledDate(dateStr);
      if (isNaN(d.getTime())) return 'Invalid date';
      return format(d, 'dd MMM yyyy • hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const getClassStatus = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = parseScheduledDate(scheduledAt);
    return scheduled > now ? 'Active' : 'Completed';
  };

  const filteredClasses = useMemo(() => {
    const filtered = classes.filter(cls => {
      const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.course_id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && getClassStatus(cls.scheduled_at) === 'Active') ||
        (statusFilter === 'completed' && getClassStatus(cls.scheduled_at) === 'Completed');

      const localDateStr = (() => {
        try {
          const d = parseScheduledDate(cls.scheduled_at);
          return format(d, 'yyyy-MM-dd');
        } catch {
          return '';
        }
      })();
      const matchesDate = !dateFilter || localDateStr === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') {
        const timeA = a.scheduled_at ? parseScheduledDate(a.scheduled_at).getTime() : 0;
        const timeB = b.scheduled_at ? parseScheduledDate(b.scheduled_at).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default: 'recent' (Most Recent)
      const timeA = a.scheduled_at ? parseScheduledDate(a.scheduled_at).getTime() : 0;
      const timeB = b.scheduled_at ? parseScheduledDate(b.scheduled_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [classes, searchTerm, statusFilter, dateFilter, sortBy]);

  // Pagination logic
  const totalItems = filteredClasses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const totalClasses = classes.length;
  const upcomingClasses = classes.filter(c => getClassStatus(c.scheduled_at) === 'Active').length;
  const completedClasses = totalClasses - upcomingClasses;
  const completionRate = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
  const totalDuration = classes.reduce((sum, c) => sum + c.duration, 0);

  const stats = [
    {
      title: 'Total Classes',
      value: totalClasses.toString(),
      icon: BookOpen,
      iconColor: 'text-[#3B82F6]',
      bgColor: 'bg-[#EFF6FF]',
      blurColor: 'bg-[#DBEAFE]'
    },
    {
      title: 'Upcoming Classes',
      value: upcomingClasses.toLocaleString(),
      icon: Calendar,
      iconColor: 'text-[#8B5CF6]',
      bgColor: 'bg-[#F5F3FF]',
      blurColor: 'bg-[#EDE9FE]'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-50 px-2 md:px-3 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-transparent">
        <div>
          <h1 className="text-[24px] sm:text-[30px] font-bold">Live Classes Management</h1>
          <p className="text-[14px] sm:text-[16px] text-[#64748B]">Schedule and manage your upcoming live sessions</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <button
            onClick={async () => {
              await loadClasses();
              toast.success("Classes refreshed successfully");
            }}
            disabled={loading}
            className="flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white text-[15px] font-semibold rounded-[14px] shadow-[0_10px_25px_rgba(124,58,237,0.35)] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(124,58,237,0.45)]"
          >
            <FaCalendarDays className="w-4 h-4" />
            Schedule Class
          </button>
        </div>
      </div>

      <div className="w-full p-2 md:p-3 flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="relative border-0 shadow-none rounded-[22px] bg-[#ffffff] overflow-hidden min-h-[180px]">
              <div className={`absolute -top-16 -right-16 w-[150px] h-[150px] ${stat.blurColor} rounded-full blur-[40px] opacity-100`}></div>

              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className={`w-12 h-12 rounded-[14px] ${stat.bgColor} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-[32px] font-bold text-[#111827] tracking-tight">{stat.value}</p>
                  <p className="text-[14px] font-medium text-[#64748B] mt-1">{stat.title}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium">
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-[24px] p-4 sm:p-7 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your Course list</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Courses by name..."
                value={searchTerm}
                maxLength={25}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Right Side Group */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[140px] sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                />
                <BsFillCalendar2Fill className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px] sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <button
                onClick={handleResetFilters}
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-500 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto mt-2 sm:mt-0"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Showing count + Sort row — outside the filter card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredClasses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(filteredClasses.length, currentPage * itemsPerPage)} of {filteredClasses.length} classes
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">Sort by</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-200 appearance-none bg-white cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error/Success  */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Classes Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 animate-pulse">Loading...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No classes found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedClasses.map((cls) => {
                const course = availableCourses.find(c => String(c.id) === String(cls.course_id));
                const courseName = course ? (course.title || course.name) : `Course #${cls.course_id}`;
                const classStatus = getClassStatus(cls.scheduled_at);
                const statusBg = classStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

                return (
                  <div key={cls.id} className="min-w-0 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">{cls.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusBg}`}>
                          {classStatus}
                        </span>
                      </div>

                      {/* Course Title Badge */}
                      <div className="mb-4">
                        <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                          {courseName}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-6 line-clamp-3">
                        Join the live session to learn and interact with the instructor in real-time.
                      </p>

                      <div className="space-y-6 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <span className="block text-gray-500 text-[13px] font-medium">Date</span>
                              <span className="block text-gray-900 font-bold mt-0.5">
                                {(() => {
                                  try {
                                    const d = parseScheduledDate(cls.scheduled_at);
                                    return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'dd MMM yyyy');
                                  } catch {
                                    return 'Invalid Date';
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-sm justify-end text-right">
                            <div>
                              <span className="block text-gray-500 text-[13px] font-medium">Time</span>
                              <span className="block text-gray-900 font-bold mt-0.5">
                                {(() => {
                                  try {
                                    const d = parseScheduledDate(cls.scheduled_at);
                                    return isNaN(d.getTime()) ? 'Invalid Time' : format(d, 'hh:mm a');
                                  } catch {
                                    return 'Invalid Time';
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-2 text-sm">
                            <Timer className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <span className="block text-gray-500 text-[13px] font-medium">Duration</span>
                              <span className="block text-gray-900 font-bold mt-0.5">{cls.duration} min</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm justify-end text-right">
                            <Link className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <button
                                onClick={() => handleCopyLink(cls.join_link)}
                                className="block text-gray-500 text-[13px] font-medium hover:text-gray-700 transition ml-auto"
                              >
                                Copy Link
                              </button>
                              <span
                                className="block text-blue-600 text-[13px] font-bold cursor-pointer hover:text-blue-700 transition mt-1 ml-auto"
                                onClick={() => window.open(cls.join_link, '_blank')}
                              >
                                Join Link
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(cls)}
                      disabled={loading || deletingId !== null}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === cls.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNumber = idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}




        {/* Copy success — floating popup (auto-hides after 1.5s) */}
        {copySuccessPopup && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
            role="status"
            aria-live="polite"
          >
            <div className="pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-green-200 bg-white p-4 shadow-lg">
              <div className="flex gap-3 items-center">
                <CheckCircle2 className="h-10 w-10 shrink-0 text-green-500" aria-hidden />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold text-gray-900">Copied successfully</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form — scrollable shell so short viewports / mobile keyboards do not clip content */}
        {showModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/50">
            <div className="flex min-h-full items-end justify-center p-4 pb-10 sm:items-center sm:p-4 sm:py-8">
              <div
                className="flex min-h-0 w-full max-w-[380px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[calc(100dvh-4rem)] sm:max-h-[min(90dvh,44rem)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="schedule-class-title"
              >
                <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
                  <h2 id="schedule-class-title" className="min-w-0 text-base font-semibold text-blue-600 sm:text-lg">
                    Schedule New class
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 no-scrollbar">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSchedule} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course
                      </label>
                      <div className="relative">
                        <select
                          value={courseId}
                          onChange={(e) => setCourseId(Number(e.target.value) || '')}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm appearance-none cursor-pointer bg-white"
                        >
                          <option value="" disabled>Select Course</option>
                          {availableCourses.length > 0 ? availableCourses.map(course => {
                            const title = course.title || course.name || `Course #${course.id}`;
                            const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                            return (
                              <option key={course.id} value={course.id}>
                                {displayTitle} (ID: {course.id})
                              </option>
                            );
                          }) : classes.reduce((unique: number[], cls) => {
                            if (!unique.includes(cls.course_id)) unique.push(cls.course_id);
                            return unique;
                          }, []).map(id => (
                            <option key={id} value={id}>Course ID: {id}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter Title"
                        maxLength={40}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Date&amp;Time
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
                          placeholder="dd/mm/yyyy, --:--"
                          required
                          min={minDateTime}
                          max={maxDateTime}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm text-gray-900 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={duration}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setDuration(val ? Number(val) : '');
                        }}
                        placeholder="Enter duration in minutes"
                        maxLength={3}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Join Link
                      </label>
                      <input
                        type="url"
                        value={joinLink}
                        onChange={(e) => setJoinLink(e.target.value)}
                        placeholder="https://meet.google.com"
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition mt-2"
                    >
                      {loading ? 'Scheduling...' : 'Schedule Class'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}