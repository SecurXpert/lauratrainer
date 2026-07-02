import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaDownload,
  FaChevronDown,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FiCalendar } from "react-icons/fi";
import { Users, BookOpen, FileText, TrendingUp, TrendingDown, Filter, RefreshCw, ChevronDown, Calendar, Award, X, Download, FileQuestion, GraduationCap } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const MiniChart = ({ type }: { type: string }) => {
  if (type === "bar-purple") {
    return (
      <div className="flex items-end justify-between h-[50px] gap-[5px] mt-4 w-full">
        {[80, 52, 98, 46, 83, 48, 69].map((h, i) => (
          <div key={i} className="w-full bg-[#A855F7] rounded-t-[4px]" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    );
  }

  const getChartDetails = () => {
    switch (type) {
      case "line-purple":
        return {
          stroke: "#6366F1",
          fill: "url(#gradient-purple)",
          path: "M0,22 C10,25 15,36 25,36 C32,36 34,8 38,8 C42,8 46,37 52,37 C58,37 61,2 67,2 C73,2 76,35 82,35 C90,35 93,11 100,11 L100,45 L0,45 Z",
          strokePath: "M0,22 C10,25 15,36 25,36 C32,36 34,8 38,8 C42,8 46,37 52,37 C58,37 61,2 67,2 C73,2 76,35 82,35 C90,35 93,11 100,11",
          defs: (
            <linearGradient id="gradient-purple" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          )
        };
      case "line-blue":
        return {
          stroke: "#2B7FFF",
          fill: "url(#gradient-blue)",
          path: "M0,25 C10,28 12,38 20,38 C28,38 32,5 37,5 C42,5 45,33 52,33 C59,33 62,12 68,12 C74,12 77,36 83,36 C89,36 93,16 100,16 L100,45 L0,45 Z",
          strokePath: "M0,25 C10,28 12,38 20,38 C28,38 32,5 37,5 C42,5 45,33 52,33 C59,33 62,12 68,12 C74,12 77,36 83,36 C89,36 93,16 100,16",
          defs: (
            <linearGradient id="gradient-blue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2B7FFF" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#2B7FFF" stopOpacity="0" />
            </linearGradient>
          )
        };
      case "line-green":
        return {
          stroke: "#00BC7D",
          fill: "url(#gradient-green)",
          path: "M0,20 C8,20 12,32 22,32 C32,32 35,14 41,14 C47,14 49,38 55,38 C61,38 65,8 70,8 C75,8 78,28 84,28 C90,28 94,8 100,8 L100,45 L0,45 Z",
          strokePath: "M0,20 C8,20 12,32 22,32 C32,32 35,14 41,14 C47,14 49,38 55,38 C61,38 65,8 70,8 C75,8 78,28 84,28 C90,28 94,8 100,8",
          defs: (
            <linearGradient id="gradient-green" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#00BC7D" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#00BC7D" stopOpacity="0" />
            </linearGradient>
          )
        };
      default:
        return null;
    }
  };

  const details = getChartDetails();
  if (!details) return null;

  return (
    <div className="h-[50px] mt-4 w-full">
      <svg viewBox="0 0 100 45" className="w-full h-full" preserveAspectRatio="none">
        {details.defs && <defs>{details.defs}</defs>}
        {details.fill !== "transparent" && (
          <path d={details.path} fill={details.fill} />
        )}
        <path d={details.strokePath} fill="none" stroke={details.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  change,
  iconBg,
  iconStyle,
  chartType,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  iconBg?: string;
  iconStyle?: React.CSSProperties;
  chartType: "line-purple" | "bar-purple" | "line-blue" | "line-green";
}) => {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[13px] font-medium text-[#64748B]">{title}</p>
          <h2 className="text-[28px] font-bold text-[#0f172a] leading-tight mt-1.5 mb-1">{value}</h2>
          {/* <p className="text-[12.5px] font-medium text-[#10B981]">{change}</p> */}
        </div>
        <div
          className={`w-[42px] h-[42px] rounded-[18px] text-white flex items-center justify-center shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.15)] ${iconBg || ""}`}
          style={iconStyle}
        >
          {icon}
        </div>
      </div>

      <MiniChart type={chartType} />
    </div>
  );
};




export default function Dashboard() {
  const navigate = useNavigate();
  const [courseCount, setCourseCount] = useState<number | string>("--");
  const [activeExamsCount, setActiveExamsCount] = useState<number | string>("--");
  const [studentsCount, setStudentsCount] = useState<number | string>("--");
  const [avgPerformance, setAvgPerformance] = useState<string>("78.5%");
  const [topCourses, setTopCourses] = useState<any[]>([
    { name: "Loading...", students: 0, width: "0%" }
  ]);
  const [trendData, setTrendData] = useState<any[]>([
    { month: "Jan", value: 65 },
    { month: "Feb", value: 72 },
    { month: "Mar", value: 68 },
    { month: "Apr", value: 78 },
    { month: "May", value: 85 },
    { month: "Jun", value: 82 },
  ]);

  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [minScore, setMinScore] = useState(70);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [courseOpen, setCourseOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setCourseOpen(false);
      setTypeOpen(false);
      setStatusOpen(false);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, examsRes, studentsRes, allCoursesRes] = await Promise.allSettled([
          axiosInstance.get("/trainer/courses/count"),
          axiosInstance.get("/admin/quiz-status-count"),
          axiosInstance.get("/trainer/my-students/count"),
          axiosInstance.get("/trainer/courses")
        ]);

        if (coursesRes.status === "fulfilled" && coursesRes.value.data && typeof coursesRes.value.data.course_count === "number") {
          setCourseCount(coursesRes.value.data.course_count);
        } else {
          setCourseCount(0);
        }

        if (examsRes.status === "fulfilled" && examsRes.value.data) {
          const data = examsRes.value.data;
          if (typeof data.approved === "number") {
            setActiveExamsCount(data.approved);
          } else if (typeof data.total_quizzes === "number") {
            setActiveExamsCount(data.total_quizzes);
          } else {
            setActiveExamsCount(0);
          }
        } else {
          setActiveExamsCount(0);
        }

        if (studentsRes.status === "fulfilled" && studentsRes.value.data) {
          const sData = studentsRes.value.data;
          if (typeof sData === "number" || typeof sData === "string") {
            setStudentsCount(sData);
          } else if (typeof sData.count === "number") {
            setStudentsCount(sData.count);
          } else if (typeof sData.student_count === "number") {
            setStudentsCount(sData.student_count);
          } else if (typeof sData.students_count === "number") {
            setStudentsCount(sData.students_count);
          } else if (typeof sData.total === "number") {
            setStudentsCount(sData.total);
          } else if (typeof sData.total_students === "number") {
            setStudentsCount(sData.total_students);
          } else {
            setStudentsCount(0);
          }
        } else {
          setStudentsCount(0);
        }



        if (allCoursesRes.status === "fulfilled" && Array.isArray(allCoursesRes.value.data)) {
          // Extract the actual student counts dynamically from the API response
          let fetchedCourses = allCoursesRes.value.data.map((c: any) => {
            const students = c.students_count ?? c.student_count ?? c.enrolled_students ?? c.students ?? c.enrollments ?? c.total_enrollments ?? 0;
            return {
              name: c.title || `Course ${c.id}`,
              students: Number(students) || 0,
              width: "0%"
            };
          });

          // Sort by highest students to display top courses, take first 4
          fetchedCourses.sort((a, b) => b.students - a.students);
          fetchedCourses = fetchedCourses.slice(0, 4);

          if (fetchedCourses.length > 0) {
            // Calculate dynamic width based on the maximum student count to show accurate distribution
            const maxStudents = Math.max(...fetchedCourses.map((c: any) => c.students), 1);
            const finalCourses = fetchedCourses.map((c: any) => ({
              ...c,
              width: c.students === 0 ? "5%" : `${Math.max((c.students / maxStudents) * 100, 5)}%`
            }));
            setTopCourses(finalCourses);
          } else {
            setTopCourses([]);
          }
        }

        // Fetch Enrollment Trend Data (Last 6 Months)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        const monthsToFetch = [];
        for (let i = 5; i >= 0; i--) {
          let m = currentMonth - i;
          let y = currentYear;
          if (m <= 0) {
            m += 12;
            y -= 1;
          }
          monthsToFetch.push({ month: m, year: y });
        }

        const promises = monthsToFetch.map(m =>
          axiosInstance.get(`/admin/enrollments/count?month=${m.month}&year=${m.year}`)
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
              // Aggressively find the first numeric value in the response object
              const values = Object.values(data);
              const numericValues = values.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseInt(v))));
              if (numericValues.length > 0) {
                count = typeof numericValues[0] === 'number' ? numericValues[0] : parseInt(numericValues[0] as string);
              }
            }
          } else if (res.status === 'rejected') {
            console.error(`Failed to fetch trend data for month ${m.month}`, res.reason);
          }
          return {
            month: monthNames[m.month - 1],
            value: count
          };
        });

        console.log("Final Trend Data for Chart:", newTrendData);

        setTrendData(newTrendData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setCourseCount(0);
        setActiveExamsCount(0);
        setStudentsCount(0);
      }
    };
    fetchDashboardData();
  }, []);

  const todayDateStr = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  };



  return (
    <div className="min-h-screen bg-[#f8fbff] p-2 md:p-3">
      <div className="w-full">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-7">
          <div>
            <h1 className="text-[30px] font-bold">Dashboard</h1>
            <p className="text-[#64748B]">
              Overview of platform performance
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={<Users className="w-[20px] h-[20px] stroke-[2.2]" />}
            title="Total Students"
            value={String(studentsCount)}
            change="+12.5% from last month"
            iconStyle={{ 
              background: "linear-gradient(135deg, #615FFF 0%, #AD46FF 100%)",
              boxShadow: "0 8px 16px rgba(97, 95, 255, 0.4)" 
            }}
            chartType="line-purple"
          />
          <StatCard
            icon={<BookOpen className="w-[20px] h-[20px] stroke-[2.5]" />}
            title="Total Courses"
            value={String(courseCount)}
            change="+8 new courses"
            iconStyle={{ 
              background: "linear-gradient(135deg, #AD46FF 0%, #F6339A 100%)",
              boxShadow: "0 8px 16px rgba(173, 70, 255, 0.4)" 
            }}
            chartType="bar-purple"
          />
          <StatCard
            icon={<GraduationCap className="w-[20px] h-[20px] stroke-[2.5]" />}
            title="Active Quizzes"
            value={String(activeExamsCount)}
            change="+5 this week"
            iconStyle={{ 
              background: "linear-gradient(135deg, #2B7FFF 0%, #00B8DB 100%)",
              boxShadow: "0 8px 16px rgba(43, 127, 255, 0.4)" 
            }}
            chartType="line-blue"
          />
          <StatCard
            icon={<TrendingUp className="w-[20px] h-[20px] stroke-[2.5]" />}
            title="Avg Performance"
            value={avgPerformance}
            change="+23.1% growth"
            iconStyle={{ 
              background: "linear-gradient(135deg, #00BC7D 0%, #00BBA7 100%)",
              boxShadow: "0 8px 16px rgba(0, 188, 125, 0.4)" 
            }}
            chartType="line-green"
          />
        </div>
        {/* Analytics Cards */}
        <div className="w-full mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-auto sm:h-[406px] bg-white border border-[#F3F4F6] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.04),_0_2px_8px_rgba(0,0,0,0.02)] px-4 sm:px-5 lg:px-7 pt-4 sm:pt-6 lg:pt-7 pb-4 sm:pb-6">
              <h2 className="text-[18px] font-bold text-[#0f172a] mb-4 sm:mb-6">
                Student Performance Trend
              </h2>

              <div className="w-full h-[200px] sm:h-[250px] lg:h-[285px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -4, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e3e5e8ff"
                      vertical
                      horizontal
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: "#64748B" }}
                      tickLine={{ stroke: "#64748B" }}
                      dy={4}
                    />

                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: "#64748B" }}
                      tickLine={{ stroke: "#64748B" }}
                      width={32}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{
                        r: 5.5,
                        fill: "#ffffff",
                        stroke: "#6366f1",
                        strokeWidth: 2.5,
                      }}
                      activeDot={{
                        r: 7,
                        fill: "#ffffff",
                        stroke: "#6366f1",
                        strokeWidth: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="h-auto sm:h-[406px] bg-white border border-[#F3F4F6] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.04),_0_2px_8px_rgba(0,0,0,0.02)] px-4 sm:px-5 lg:px-7 pt-4 sm:pt-6 lg:pt-7 pb-4 sm:pb-6 flex flex-col">
              <h2 className="text-[18px] font-bold text-[#0f172a] mb-4 sm:mb-6">
                Course Popularity
              </h2>

              <div className="space-y-[18px] sm:space-y-[25px] flex-1">
                {topCourses.map((course) => (
                  <div key={course.name}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] font-semibold text-[#364153]">
                        {course.name}
                      </p>

                      {/* <p className="text-[14px] text-slate-500">
                        {course.students} students
                      </p> */}
                    </div>

                    <div className="w-full h-[12px] bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: course.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-5 sm:pt-6">
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full py-[8px] rounded-[12px] border border-[#4F46E5] text-[#4F46E5] text-[15px] font-medium bg-transparent hover:bg-[#4F46E5]/5 transition-colors"
                >
                  View More Courses
                </button>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
