import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from './services/api/api';

import { LiveClass } from '../components/Classes/ClassesTypes';
import { normalizeLiveClass, parseScheduledDate, getClassStatus } from '../components/Classes/ClassesUtils';
import { ClassesHeader } from '../components/Classes/ClassesHeader';
import { ClassesStats } from '../components/Classes/ClassesStats';
import { ClassesFilter } from '../components/Classes/ClassesFilter';
import { ClassesListHeader } from '../components/Classes/ClassesListHeader';
import { ClassesGrid } from '../components/Classes/ClassesGrid';
import { ClassesPagination } from '../components/Classes/ClassesPagination';
import { ScheduleClassModal } from '../components/Classes/ScheduleClassModal';

const API_BASE = `${API_BASE_URL}`;

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
  }, [showModal]);

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
      // default: 'recent'
      const timeA = a.scheduled_at ? parseScheduledDate(a.scheduled_at).getTime() : 0;
      const timeB = b.scheduled_at ? parseScheduledDate(b.scheduled_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [classes, searchTerm, statusFilter, dateFilter, sortBy]);

  const totalItems = filteredClasses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <ClassesHeader 
        loading={loading} 
        onRefresh={() => loadClasses()} 
        onScheduleClick={() => setShowModal(true)} 
      />

      <div className="w-full p-2 md:p-3 flex-1">
        <ClassesStats classes={classes} />

        <ClassesFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          handleResetFilters={handleResetFilters}
        />

        <ClassesListHeader 
          filteredClassesCount={filteredClasses.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <ClassesGrid 
          loading={loading}
          filteredClassesCount={filteredClasses.length}
          paginatedClasses={paginatedClasses}
          availableCourses={availableCourses}
          deletingId={deletingId}
          handleDelete={handleDelete}
          handleCopyLink={handleCopyLink}
        />

        <ClassesPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

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

        <ScheduleClassModal 
          showModal={showModal}
          setShowModal={setShowModal}
          courseId={courseId}
          setCourseId={setCourseId}
          title={title}
          setTitle={setTitle}
          scheduledAt={scheduledAt}
          setScheduledAt={setScheduledAt}
          duration={duration}
          setDuration={setDuration}
          joinLink={joinLink}
          setJoinLink={setJoinLink}
          availableCourses={availableCourses}
          classes={classes}
          handleSchedule={handleSchedule}
          resetForm={resetForm}
          error={error}
          loading={loading}
          minDateTime={minDateTime}
          maxDateTime={maxDateTime}
        />
      </div>
    </div>
  );
}