import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Student, AttendanceRecord } from './Types';
import { API_BASE_URL } from '@/pages/services/api/api';

const VIEW_ENDPOINT = '/attendance/instructor/view-attendance';

export const useAttendanceFetcher = (courseId: string, fromDate: string, toDate: string, courses: any[]) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem('access_token');
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchStudents = async () => {
    if (!token) {
      toast.error('No token found. Please login.');
      navigate('/login');
      return;
    }
    const defaultFrom = () => {
      const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
    };
    const defaultTo = () => new Date().toISOString().split('T')[0];
    setLoading(true);
    try {
      let data: any[] = [];
      if (!courseId) {
        if (courses.length > 0) {
          const fetchPromises = courses.map(c =>
            axiosInstance.get(VIEW_ENDPOINT, {
              params: { course_id: c.id, from_date: fromDate || defaultFrom(), to_date: toDate || defaultTo() }
            }).catch(() => ({ data: [] }))
          );
          const responses = await Promise.all(fetchPromises);
          responses.forEach(res => { if (res && Array.isArray(res.data)) data = [...data, ...res.data]; });
        }
      } else {
        const res = await axiosInstance.get(VIEW_ENDPOINT, {
          params: { course_id: courseId, from_date: fromDate || defaultFrom(), to_date: toDate || defaultTo() }
        });
        data = res.data || [];
      }
      const sortedData = [...data].sort((a: any, b: any) => {
        const dateA = a.check_in_time || a.date;
        const dateB = b.check_in_time || b.date;
        if (!dateA) return 1; if (!dateB) return -1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      const studentMap = new Map<number, Student>();
      sortedData.forEach((r: any) => {
        const sid = r.student_id;
        if (sid && !studentMap.has(sid)) {
          let status = 'Absent';
          if (r.status) status = r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase();
          else if (r.check_in_time) {
            const checkInDate = new Date(r.check_in_time);
            if (checkInDate.getHours() > 9 || (checkInDate.getHours() === 9 && checkInDate.getMinutes() > 15)) status = 'Late';
            else status = 'Present';
          }
          const formatTime = (iso?: string) => iso ? (new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) || '-') : '-';
          studentMap.set(sid, {
            id: sid, student_id: sid, student_name: r.student_name || 'Unknown', course: r.course_name || 'Web Development',
            check_in_time: formatTime(r.check_in_time), check_out_time: formatTime(r.check_out_time), status
          });
        }
      });
      setStudents(Array.from(studentMap.values()));
    } catch (err: any) {
      toast.error('Failed to load students');
      if (err.response?.status === 401) { localStorage.removeItem('access_token'); navigate('/login'); }
    } finally { setLoading(false); }
  };

  const fetchAttendanceDetail = async (studentId: number, studentName: string, preservePage = false) => {
    const defaultFrom = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0]; };
    const defaultTo = () => new Date().toISOString().split('T')[0];
    setLoading(true);
    try {
      let data: any[] = [];
      if (!courseId) {
        if (courses.length > 0) {
          const fetchPromises = courses.map(c => axiosInstance.get(VIEW_ENDPOINT, { params: { course_id: c.id, from_date: fromDate || defaultFrom(), to_date: toDate || defaultTo() } }).catch(() => ({ data: [] })));
          const responses = await Promise.all(fetchPromises);
          responses.forEach(res => { if (res && Array.isArray(res.data)) data = [...data, ...res.data]; });
        }
      } else {
        const res = await axiosInstance.get(VIEW_ENDPOINT, { params: { course_id: courseId, from_date: fromDate || defaultFrom(), to_date: toDate || defaultTo() } });
        data = res.data || [];
      }
      const records = data.filter((r: any) => r.student_id === studentId).map((r: any) => {
        const dateObj = new Date(r.date || r.attended_at || r.check_in_time || '');
        const dateStr = isNaN(dateObj.getTime()) ? '-' : `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const formatTime = (iso?: string) => iso ? (new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || '-') : '-';
        return {
          id: r.id || 0, student_id: r.student_id, student_name: r.student_name || studentName,
          date: dateStr, check_in: formatTime(r.check_in_time), check_out: formatTime(r.check_out_time),
          duration_hours: r.duration_hours != null ? Number(r.duration_hours) : 0, check_in_time: r.check_in_time || '', check_out_time: r.check_out_time || '', status: r.status || '',
        };
      });
      records.sort((a, b) => {
        const dateA = a.check_in_time || a.date; const dateB = b.check_in_time || b.date;
        if (!dateA || dateA === '-') return 1; if (!dateB || dateB === '-') return -1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      setAttendanceRecords(records);
      if (!preservePage) setCurrentPage(1);
      else setCurrentPage(prev => Math.max(Math.ceil(records.length / 10), 1) < prev ? Math.max(Math.ceil(records.length / 10), 1) : prev);
      setSelectedStudent({ id: studentId, student_id: studentId, student_name: studentName, course: '', check_in_time: '', check_out_time: '', status: '' });
      setViewMode('detail');
    } catch (err) { toast.error('Failed to load details'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [courseId, fromDate, toDate, courses.length]);

  return { students, loading, attendanceRecords, selectedStudent, setSelectedStudent, viewMode, setViewMode, currentPage, setCurrentPage, fetchStudents, fetchAttendanceDetail, setAttendanceRecords };
};
