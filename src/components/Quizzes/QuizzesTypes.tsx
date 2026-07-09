export interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  file?: string;
  status?: "active" | "inactive" | "draft";
  questions_count?: number;
  attempts?: number;
  time?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface QuizzesStatsType {
  totalQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  activeQuizzes: number;
}

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const getQuizStatus = (quiz: Quiz): string => {
  if (quiz.status) return quiz.status.toLowerCase();
  if (quiz.is_active === true) return "active";
  if (quiz.is_active === false) return "inactive";
  return "active";
};
