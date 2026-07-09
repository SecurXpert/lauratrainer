import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/pages/services/api/api";

export const useAnalyticsMetrics = (dateRange: string) => {
  const [activeStudentsCount, setActiveStudentsCount] = useState<number | null>(null);
  const [totalEnrolledStudents, setTotalEnrolledStudents] = useState<number | null>(null);
  const [liveClassesCount, setLiveClassesCount] = useState<number | null>(null);
  const [totalQuizzesCount, setTotalQuizzesCount] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<string>("76.3%");
  const [topicPerformance, setTopicPerformance] = useState<any[]>([
    { topic: "React Hooks", score: 88, color: "#14B8A6" },
    { topic: "State Mgmt", score: 72, color: "#8B5CF6" },
    { topic: "Async/Await", score: 65, color: "#F43F5E" },
    { topic: "CSS Grid", score: 81, color: "#14B8A6" },
    { topic: "TypeScript", score: 59, color: "#F43F5E" },
  ]);

  useEffect(() => {
    const queryParams = dateRange ? `?date=${dateRange}` : '';
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchActiveStudentsCount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/trainer/my-students/count${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          const activeCount = typeof res.data.count === 'number' ? res.data.count : (res.data.total_students ?? res.data.total_enrolled_students ?? 0);
          setActiveStudentsCount(activeCount);
          const enrolledCount = typeof res.data.total_enrolled_students === 'number' ? res.data.total_enrolled_students : (res.data.count ?? res.data.total_students ?? 0);
          setTotalEnrolledStudents(enrolledCount);
        }
      } catch (err) {
        console.error('Failed to fetch active students count:', err);
      }
    };

    const fetchLiveClassesCount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/trainer/live-classes${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) setLiveClassesCount(res.data.length);
      } catch (err) {
        console.error('Failed to fetch live classes count:', err);
      }
    };

    const fetchQuizzesCount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/trainer/quizzes${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
          setTotalQuizzesCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch quizzes count:', err);
      }
    };

    const fetchAverageScore = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/quiz/admin/results/student/16${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          if (res.data.average_score !== undefined) {
            setAverageScore(res.data.average_score.toString());
          } else if (res.data.accuracy_percentage !== undefined) {
            setAverageScore(`${Math.round(Number(res.data.accuracy_percentage))}%`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch average score:', err);
      }
    };

    const fetchQuizDetailedAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/quiz/admin/results/analytics/detailed${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && Array.isArray(res.data.quiz_wise_analytics)) {
          const topicColors = ["#14B8A6", "#8B5CF6", "#F43F5E", "#10B981", "#F59E0B", "#3B82F6"];
          const topics = res.data.quiz_wise_analytics.map((q: any, idx: number) => ({
            topic: q.quiz_name,
            score: q.accuracy_percentage !== undefined
              ? Math.round(Number(q.accuracy_percentage))
              : Math.round(Number(q.average_score || 0) * 100),
            color: topicColors[idx % topicColors.length]
          }));
          setTopicPerformance(topics.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch quiz detailed analytics:', err);
      }
    };

    fetchActiveStudentsCount();
    fetchLiveClassesCount();
    fetchQuizzesCount();
    fetchAverageScore();
    fetchQuizDetailedAnalytics();
  }, [dateRange]);

  return { activeStudentsCount, totalEnrolledStudents, liveClassesCount, totalQuizzesCount, averageScore, topicPerformance };
};
