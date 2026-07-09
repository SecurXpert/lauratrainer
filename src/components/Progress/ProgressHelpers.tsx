import { API_BASE_URL } from "@/pages/services/api/api";

export const getRelativeTime = (dateString: string | null) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "Never";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
};

export const getAvatarUrl = (profilePicture: string | null) => {
  if (!profilePicture) {
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4";
  }
  if (profilePicture.startsWith("http")) return profilePicture;
  return `${API_BASE_URL}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`;
};

export const getInstructorForCourse = (courseTitle: string) => {
  const title = courseTitle.toLowerCase();
  if (title.includes("web") || title.includes("stack") || title.includes("html") || title.includes("js")) return "Dr. Ravi Kumar";
  if (title.includes("data") || title.includes("ml") || title.includes("python") || title.includes("science")) return "Prof. Anita Desai";
  if (title.includes("ui") || title.includes("ux") || title.includes("design") || title.includes("figma")) return "Ms. Sarah Chen";
  if (title.includes("cloud") || title.includes("devops") || title.includes("aws") || title.includes("docker")) return "Mr. James Park";
  return "Dr. Elena Volkov";
};

export const fetchSingleProgress = async (studentId: string, courseId: string, token: string | null) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/courses/trainer/students/${studentId}/courses/${courseId}/progress`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const buildProgressRow = (pData: any, studentId: string, courseId: string, courses: any[], students: any[]) => {
  if (!pData) return null;
  const courseObj = courses.find(c => c.id.toString() === courseId.toString());
  const studentObj = students.find(s => s.id.toString() === studentId.toString());

  const courseTitle = courseObj ? courseObj.title : "Selected Course";
  const studentName = studentObj ? studentObj.name : pData.student_name || "Student";

  const completedCount = pData.completed_modules ?? 0;
  const totalCount = pData.total_modules ?? 0;
  const compRatio = pData.completion_ratio ?? (totalCount > 0 ? completedCount / totalCount : 0);

  const attendanceVal = Math.round(compRatio * 100);
  const assignmentsCompleted = Math.round(completedCount * 0.9);
  const assignmentsTotal = Math.round(totalCount * 0.9);

  let status = "In Progress";
  if (compRatio === 1) status = "Completed";
  else if (compRatio === 0) status = "Not Started";
  else if (attendanceVal < 60) status = "At Risk";

  const getRowLastActivity = () => {
    if (!pData.modules || pData.modules.length === 0) return "Never";
    const completedModules = pData.modules.filter((m: any) => m.completed_at);
    if (completedModules.length === 0) return "Never";
    const maxDate = completedModules.reduce((max: Date, curr: any) => {
      const currDate = new Date(curr.completed_at);
      return currDate > max ? currDate : max;
    }, new Date(0));
    if (maxDate.getTime() === 0) return "Never";
    return getRelativeTime(maxDate.toISOString());
  };

  return {
    id: `${studentId}-${courseId}`,
    studentName,
    course: courseTitle,
    instructor: pData.instructor_name || pData.instructor || getInstructorForCourse(courseTitle),
    modules: `${completedCount} / ${totalCount}`,
    assignments: `${assignmentsCompleted} / ${assignmentsTotal}`,
    attendance: `${attendanceVal}%`,
    lastActivity: getRowLastActivity(),
    status
  };
};
