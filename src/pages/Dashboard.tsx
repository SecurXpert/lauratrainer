import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardStatsGrid from "../components/Dashboard/DashboardStatsGrid";
import DashboardAnalytics from "../components/Dashboard/DashboardAnalytics";

export default function Dashboard() {
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

  return (
    <div className="min-h-screen bg-[#f8fbff] p-2 md:p-3">
      <div className="w-full">
        <DashboardHeader />

        <DashboardStatsGrid 
          studentsCount={studentsCount}
          courseCount={courseCount}
          activeExamsCount={activeExamsCount}
          avgPerformance={avgPerformance}
        />

        <DashboardAnalytics 
          trendData={trendData}
          topCourses={topCourses}
        />
      </div>
    </div>
  );
}
