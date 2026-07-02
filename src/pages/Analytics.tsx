import { useState, useEffect } from "react";
import {
  BarChart,
  Users,
  BookOpen,
  Calendar,
  ChevronDown,
  Search,
  Star,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import axios from "axios";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("Students");
  const [activeStudentsCount, setActiveStudentsCount] = useState<number | null>(null);
  const [totalEnrolledStudents, setTotalEnrolledStudents] = useState<number | null>(null);
  const [liveClassesCount, setLiveClassesCount] = useState<number | null>(null);
  const [totalQuizzesCount, setTotalQuizzesCount] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<string>("76.3%");
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

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    const queryParams = dateRange ? `?date=${dateRange}` : '';

    const fetchActiveStudentsCount = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/trainer/my-students/count${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/trainer/live-classes${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (Array.isArray(res.data)) {
          setLiveClassesCount(res.data.length);
        }
      } catch (err) {
        console.error('Failed to fetch live classes count:', err);
      }
    };

    const fetchTrendData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const monthsToFetch = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          monthsToFetch.push({ month: d.getMonth() + 1, year: d.getFullYear() });
        }

        const promises = monthsToFetch.map(m =>
          axios.get(`https://lauratek.in:8000/admin/enrollments/count?month=${m.month}&year=${m.year}`, {
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
                const numericValues = values.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseInt(v))));
                if (numericValues.length > 0) {
                  count = typeof numericValues[0] === 'number' ? numericValues[0] : parseInt(numericValues[0] as string);
                }
              }
            }
          }
          return {
            name: monthNames[m.month - 1],
            value: count
          };
        });

        if (newTrendData.some(d => d.value > 0)) {
          setMainChartData(newTrendData);
        }
      } catch (err) {
        console.error('Failed to fetch trend data:', err);
      }
    };

    const fetchQuizzesCount = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/trainer/quizzes${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
          setTotalQuizzesCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch quizzes count:', err);
      }
    };

    const fetchCourses = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/trainer/courses${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (Array.isArray(res.data)) {
          const bgColors = ['bg-[#0F172A]', 'bg-[#F59E0B]', 'bg-[#EC4899]', 'bg-[#3B82F6]', 'bg-[#8B5CF6]', 'bg-[#10B981]'];
          const mapped = await Promise.all(res.data.map(async (c: any, index: number) => {
            let students = Number(c.students_count ?? c.student_count ?? c.enrolled_students ?? c.students ?? c.enrollments ?? c.total_enrollments ?? 0);

            if (students === 0 && c.id) {
              try {
                const streaksRes = await axios.get(`https://lauratek.in:8000/student-streaks/trainer/course/${c.id}${queryParams}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (Array.isArray(streaksRes.data)) {
                  students = streaksRes.data.length;
                }
              } catch (err) {
                console.error(`Failed to fetch student streaks for course ${c.id}:`, err);
              }
            }

            const rating = Number(c.rating) || 0;

            let progress = Number(c.progress ?? c.completion_rate ?? c.average_progress ?? 0);
            
            // If the backend doesn't provide progress directly, we can try to fetch it dynamically if an endpoint exists, 
            // but for now we remove the hardcoded student '16' fetch and static math.
            // try {
            //   const progRes = await axios.get(`https://lauratek.in:8000/courses/trainer/courses/${c.id}/analytics${queryParams}`, {
            //     headers: { Authorization: `Bearer ${token}` }
            //   });
            //   if (progRes.data && progRes.data.average_progress !== undefined) {
            //     progress = Math.round(progRes.data.average_progress * 100);
            //   }
            // } catch (err) {
            //   console.error(`Failed to fetch progress for course ${c.id}:`, err);
            // }

            let image = c.course_thumbnail || c.thumbnail_url || c.thumbnail || c.image || c.course_image || c.cover_image || null;
            if (image && !image.startsWith('http')) {
              image = `https://lauratek.in:8000${image.startsWith('/') ? '' : '/'}${image}`;
            }

            return {
              id: c.id || index,
              name: c.title || `Course ${c.id || index}`,
              students,
              rating,
              progress,
              bgColor: bgColors[index % bgColors.length],
              image
            };
          }));

          // Sort by progress descending for Top Performing Courses (and by students count as fallback)
          const sortedByProgress = [...mapped].sort((a: any, b: any) => {
            if (b.progress !== a.progress) {
              return b.progress - a.progress;
            }
            return b.students - a.students;
          });
          setTopCoursesData(sortedByProgress.slice(0, 5));


        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };

    const fetchAverageScore = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/quiz/admin/results/student/16${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/quiz/admin/results/analytics/detailed${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
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

    const fetchStudentPerformance = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`https://lauratek.in:8000/quiz/admin/results/analytics/students-detailed${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        let dataArray = [];
        if (Array.isArray(res.data)) {
          dataArray = res.data;
        } else if (res.data && Array.isArray(res.data.student_analytics)) {
          dataArray = res.data.student_analytics;
        } else if (res.data && Array.isArray(res.data.items)) {
          dataArray = res.data.items;
        }

        const avatarColors = ['bg-[#8B5CF6]', 'bg-[#A78BFA]', 'bg-[#6366F1]', 'bg-[#10B981]', 'bg-[#F59E0B]'];
        
        const mapped = dataArray.map((student: any, idx: number) => {
          let scoreColor = 'text-gray-700';
          
          let score = 0;
          if (student.accuracy_percentage !== undefined) {
             score = Math.round(Number(student.accuracy_percentage));
          } else if (student.average_score !== undefined) {
             score = Math.round(Number(student.average_score));
             if (score <= 1) score = Math.round(score * 100);
          }
          
          if (score >= 80) {
            scoreColor = 'text-[#10B981]';
          } else if (score >= 60) {
            scoreColor = 'text-[#3B82F6]';
          } else {
            scoreColor = 'text-[#EF4444]';
          }

          const name = student.student_name || 'Unknown Student';
          const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

          return {
            initials,
            name,
            course: student.course_name || student.quiz_name || '-',
            score,
            scoreColor,
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
    fetchActiveStudentsCount();
    fetchLiveClassesCount();
    fetchTrendData();
    fetchQuizzesCount();
    fetchCourses();
    fetchAverageScore();
    fetchQuizDetailedAnalytics();
  }, [dateRange]);


  const [studentPerformanceData, setStudentPerformanceData] = useState<any[]>([]);

  const [topCoursesData, setTopCoursesData] = useState<any[]>([]);

  const courseEngagementData = [
    { name: 'Intro', value: 100 },
    { name: 'Ch.2', value: 85 },
    { name: 'Ch.3', value: 80 },
    { name: 'Ch.4', value: 92 },
    { name: 'Ch.5', value: 65 },
    { name: 'Ch.6', value: 58 },
    { name: 'Ch.7', value: 72 },
    { name: 'Final', value: 62 },
  ];

  const difficultyData = [
    { name: "Easy", value: 30, color: "#22C55E" },
    { name: "Medium", value: 45, color: "#F59E0B" },
    { name: "Hard", value: 25, color: "#EF4444" },
  ];

  const [topicPerformance, setTopicPerformance] = useState<any[]>([
    { topic: "React Hooks", score: 88, color: "#14B8A6" },
    { topic: "State Mgmt", score: 72, color: "#8B5CF6" },
    { topic: "Async/Await", score: 65, color: "#F43F5E" },
    { topic: "CSS Grid", score: 81, color: "#14B8A6" },
    { topic: "TypeScript", score: 59, color: "#F43F5E" },
  ]);

  const stats = [
    { title: "Total Quizzes", value: totalQuizzesCount !== null ? totalQuizzesCount.toString() : "0", icon: Target, bg: "bg-indigo-500" },
    { title: "Average Score", value: averageScore, icon: TrendingUp, bg: "bg-purple-500" }
  ];

  const filteredStudents = studentPerformanceData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(studentSearchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#615FFF] via-[#AD46FF] to-[#155DFC] rounded-[14px] flex items-center justify-center shadow-[0_8px_20px_-5px_rgba(173,70,255,0.5)] shrink-0">
            <BarChart className="w-[26px] h-[26px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Analytics Dashboard</h1>
            <p className="text-slate-500 text-[13px] mt-1 max-w-[400px]">
              Monitor student performance, course engagement, teaching effectiveness, and learning outcomes from one place.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9 pl-10 pr-4 bg-white border border-slate-200 hover:border-slate-300 rounded-full flex items-center text-[13px] font-medium text-slate-600 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="flex flex-wrap gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white h-[180px] w-[250px] rounded-[20px] px-5 py-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden shrink-0">
          <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#e9d5ff] rounded-full blur-[40px] opacity-100"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#7C86FF] to-[#4F39F6] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-[30px] font-bold text-slate-900 leading-none">
                {activeStudentsCount !== null ? activeStudentsCount.toLocaleString() : "0"}
              </h3>
            </div>
            <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
              <p className="text-[13px] font-semibold text-slate-700">Active Students</p>
              <div className="w-20 h-7 shrink-0">
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white h-[180px] w-[250px] rounded-[20px] px-5 py-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden shrink-0">
          <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#51A2FF] to-[#155DFC] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-[30px] font-bold text-slate-900 leading-none">
                {liveClassesCount !== null ? liveClassesCount.toLocaleString() : "0"}
              </h3>
            </div>
            <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
              <p className="text-[13px] font-semibold text-slate-700">Live Classes</p>
              <div className="w-20 h-7 shrink-0">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white h-[350px] rounded-[20px] px-5 py-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden shrink-0 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Student Activity Trend</h2>
            <p className="text-[13px] text-slate-500">
              Total Enrolled Students: <span className="font-bold text-indigo-600">{totalEnrolledStudents !== null ? totalEnrolledStudents.toLocaleString() : "0"}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                itemStyle={{ color: "#0F172A", fontWeight: 600 }}
                cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Performance Table Section */}
      <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Student Performance</h2>
            {/* <p className="text-[13px] text-slate-500">Selected course</p> */}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-[220px]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full custom-scrollbar pb-2">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quiz Name</th>
                <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Attempts</th>
                <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Score</th>
                <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${student.avatarColor} text-white flex items-center justify-center text-[12px] font-bold shrink-0`}>
                          {student.initials}
                        </div>
                        <span className="font-semibold text-[14px] text-gray-900 whitespace-nowrap">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[14px] text-gray-600 font-medium">
                      {student.course}
                    </td>
                    <td className="py-4 px-4 text-[14px] text-gray-600 font-medium">
                      {student.assignments}
                    </td>
                    <td className={`py-4 px-4 text-[14px] font-bold ${student.scoreColor}`}>
                      {student.score}%
                    </td>
                    <td className="py-4 px-4 text-[14px] font-bold text-indigo-600">
                      {student.accuracy}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search className="w-8 h-8 mb-3 text-gray-300" />
                      <p className="text-[14px] font-medium text-gray-500">No students found matching your filters.</p>
                      <button
                        onClick={() => {
                          setStudentSearchTerm("");
                        }}
                        className="mt-3 text-[13px] text-indigo-600 font-semibold hover:text-indigo-700"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Bottom Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Top Performing Courses */}
        <div className="bg-white rounded-[16px] h-[400px] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h2 className="text-[18px] font-bold text-slate-900">Top Performing Courses</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Ranked by completion rate and engagement</p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col justify-between mt-1">
            {topCoursesData.length > 0 ? topCoursesData.map((course) => (
              <div key={course.id} className="flex gap-3">
                {course.image ? (
                  <div className={`w-[35px] h-[35px] rounded-lg shrink-0 overflow-hidden relative border border-slate-100`}>
                    <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-[35px] h-[35px] rounded-lg ${course.bgColor} shrink-0 overflow-hidden relative`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <BookOpen className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-[14px] truncate mb-0.5">{course.name}</h3>
                  <div className="flex items-center gap-3 text-[12px] text-slate-500 mb-1.5">
                  </div>
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#A855F7] to-[#6366F1] rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    {/* <span className="text-[12px] text-slate-500 font-medium min-w-[28px]">{course.progress}%</span> */}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <BookOpen className="w-12 h-12 mb-3 text-gray-200" />
                <p className="text-[14px] font-medium text-gray-500">No courses found for this date.</p>
              </div>
            )}
          </div>
        </div>
        {/* Quiz Analytics Section */}
        <div className="bg-white rounded-[16px] h-[400px] p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col">
          {/* Header */}
          <div className="mb-3">
            <h2 className="text-[17px] font-bold text-slate-900">Quiz Analytics</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Performance breakdown across all published quizzes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3.5 shrink-0">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-slate-50/70 rounded-xl p-2.5 flex items-center gap-3 border border-slate-100">
                  <div className={`${item.bg} w-8 h-8 rounded-[8px] flex items-center justify-center text-white shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[11px] font-medium mb-0.5">{item.title}</p>
                    <h3 className="text-[17px] font-bold text-slate-900 leading-tight">{item.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics Section */}
          <div className="flex flex-col min-h-0 flex-1">
            <h3 className="text-[14px] font-bold text-slate-800 mb-2 shrink-0">Topic-wise Performance</h3>
            <div className="flex-1 overflow-hidden space-y-2.5">
              {topicPerformance.length > 0 ? topicPerformance.map((item) => (
                <div key={item.topic}>
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className="text-[12px] text-slate-600 font-medium truncate" title={item.topic}>{item.topic}</span>
                    <span className="font-semibold text-[12px] text-slate-700 shrink-0">{item.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.score}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-4">
                  <Target className="w-10 h-10 mb-3 text-gray-200" />
                  <p className="text-[13px] font-medium text-gray-500">No quiz data found for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
