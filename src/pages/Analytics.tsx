import { useState } from "react";
import { useAnalyticsMetrics } from "@/components/Analytics/useAnalyticsMetrics";
import { useAnalyticsCharts } from "@/components/Analytics/useAnalyticsCharts";
import { AnalyticsHeader } from "@/components/Analytics/AnalyticsHeader";
import { MetricCards } from "@/components/Analytics/MetricCards";
import { StudentActivityChart } from "@/components/Analytics/StudentActivityChart";
import { StudentPerformanceTable } from "@/components/Analytics/StudentPerformanceTable";
import { TopPerformingCourses } from "@/components/Analytics/TopPerformingCourses";
import { QuizAnalyticsCard } from "@/components/Analytics/QuizAnalyticsCard";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("");

  const {
    activeStudentsCount,
    totalEnrolledStudents,
    liveClassesCount,
    totalQuizzesCount,
    averageScore,
    topicPerformance
  } = useAnalyticsMetrics(dateRange);

  const {
    mainChartData,
    studentPerformanceData,
    topCoursesData
  } = useAnalyticsCharts(dateRange);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
      <AnalyticsHeader dateRange={dateRange} setDateRange={setDateRange} />
      <MetricCards activeStudentsCount={activeStudentsCount} liveClassesCount={liveClassesCount} />
      <StudentActivityChart totalEnrolledStudents={totalEnrolledStudents} mainChartData={mainChartData} />
      <StudentPerformanceTable studentPerformanceData={studentPerformanceData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <TopPerformingCourses topCoursesData={topCoursesData} />
        <QuizAnalyticsCard totalQuizzesCount={totalQuizzesCount} averageScore={averageScore} topicPerformance={topicPerformance} />
      </div>
    </div>
  );
};

export default Analytics;
