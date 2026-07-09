import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/pages/services/api/api";

export const useAnalyticsCharts = (dateRange: string) => {
  const [mainChartData, setMainChartData] = useState<any[]>([
    { name: "Jan W1", value: 140 },
    { name: "Jan W2", value: 160 },
    { name: "Jan W3", value: 170 },
    { name: "Jan W4", value: 165 },
    { name: "Feb W1", value: 185 },
    { name: "Feb W2", value: 195 },
    { name: "Feb W3", value: 205 },
    { name: "Feb W4", value: 215 },
    { name: "Mar W1", value: 225 },
    { name: "Mar W2", value: 235 },
  ]);
  const [studentPerformanceData, setStudentPerformanceData] = useState<any[]>([]);
  const [topCoursesData, setTopCoursesData] = useState<any[]>([]);

  useEffect(() => {
    const queryParams = dateRange ? `?date=${dateRange}` : '';
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchTrendData = async () => {
      try {
        const monthsToFetch = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          monthsToFetch.push({ month: d.getMonth() + 1, year: d.getFullYear() });
        }

        const promises = monthsToFetch.map(m =>
          axios.get(`${API_BASE_URL}/admin/enrollments/count?month=${m.month}&year=${m.year}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );

        const results = await Promise.allSettled(promises);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const newTrendData = monthsToFetch.map((m, index) => {
          const res = results[index];
          let count = 0;
          if (res.status === 'fulfilled' && res.value.data !== undefined) {
            const data = res.value.data;
            if (typeof data === 'number') {
              count = data;
            } else if (typeof data === 'string') {
              count = parseInt(data) || 0;
            } else if (typeof data === 'object' && data !== null) {
              if (typeof data.total_enrolled_students === 'number') {
                count = data.total_enrolled_students;
              } else {
                const values = Object.values(data);
                const numericValues = values.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseInt(v as string))));
                if (numericValues.length > 0) {
                  count = typeof numericValues[0] === 'number' ? numericValues[0] : parseInt(numericValues[0] as string);
                }
              }
            }
          }
          return { name: monthNames[m.month - 1], value: count };
        });

        if (newTrendData.some(d => d.value > 0)) {
          setMainChartData(newTrendData);
        }
      } catch (err) {
        console.error('Failed to fetch trend data:', err);
      }
    };

    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/trainer/courses${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          const bgColors = ['bg-[#0F172A]', 'bg-[#F59E0B]', 'bg-[#EC4899]', 'bg-[#3B82F6]', 'bg-[#8B5CF6]', 'bg-[#10B981]'];
          const mapped = await Promise.all(res.data.map(async (c: any, index: number) => {
            let students = Number(c.students_count ?? c.student_count ?? c.enrolled_students ?? c.students ?? c.enrollments ?? c.total_enrollments ?? 0);
            if (students === 0 && c.id) {
              try {
                const streaksRes = await axios.get(`${API_BASE_URL}/student-streaks/trainer/course/${c.id}${queryParams}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (Array.isArray(streaksRes.data)) students = streaksRes.data.length;
              } catch (err) {
                console.error(`Failed to fetch student streaks for course ${c.id}:`, err);
              }
            }
            const rating = Number(c.rating) || 0;
            let progress = Number(c.progress ?? c.completion_rate ?? c.average_progress ?? 0);
            let image = c.course_thumbnail || c.thumbnail_url || c.thumbnail || c.image || c.course_image || c.cover_image || null;
            if (image && !image.startsWith('http')) image = `${API_BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
            return { id: c.id || index, name: c.title || `Course ${c.id || index}`, students, rating, progress, bgColor: bgColors[index % bgColors.length], image };
          }));
          const sortedByProgress = [...mapped].sort((a: any, b: any) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return b.students - a.students;
          });
          setTopCoursesData(sortedByProgress.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };

    const fetchStudentPerformance = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/quiz/admin/results/analytics/students-detailed${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let dataArray = [];
        if (Array.isArray(res.data)) dataArray = res.data;
        else if (res.data && Array.isArray(res.data.student_analytics)) dataArray = res.data.student_analytics;
        else if (res.data && Array.isArray(res.data.items)) dataArray = res.data.items;

        const avatarColors = ['bg-[#8B5CF6]', 'bg-[#A78BFA]', 'bg-[#6366F1]', 'bg-[#10B981]', 'bg-[#F59E0B]'];
        
        const mapped = dataArray.map((student: any, idx: number) => {
          let scoreColor = 'text-gray-700';
          let score = 0;
          if (student.accuracy_percentage !== undefined) score = Math.round(Number(student.accuracy_percentage));
          else if (student.average_score !== undefined) {
             score = Math.round(Number(student.average_score));
             if (score <= 1) score = Math.round(score * 100);
          }
          if (score >= 80) scoreColor = 'text-[#10B981]';
          else if (score >= 60) scoreColor = 'text-[#3B82F6]';
          else scoreColor = 'text-[#EF4444]';

          const name = student.student_name || 'Unknown Student';
          const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

          return {
            initials, name, course: student.course_name || student.quiz_name || '-', score, scoreColor,
            accuracy: student.accuracy_percentage !== undefined ? Math.round(Number(student.accuracy_percentage)) : score,
            assignments: `${student.total_quizzes_taken || student.attempts || student.total_attempts || 0}`,
            avatarColor: avatarColors[idx % avatarColors.length]
          };
        });
        setStudentPerformanceData(mapped);
      } catch (err) {
        console.error('Failed to fetch student performance:', err);
      }
    };

    fetchStudentPerformance();
    fetchTrendData();
    fetchCourses();
  }, [dateRange]);

  return { mainChartData, studentPerformanceData, topCoursesData };
};
