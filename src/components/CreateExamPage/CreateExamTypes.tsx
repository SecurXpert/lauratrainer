export interface ExamQuestion {
  question_bank_id: number;
  score: number;
}

export interface ExamFormState {
  title: string;
  description: string;
  course_id: string;
  window_start: string;
  window_end: string;
  duration: string;
  category: string;
  questions: Record<string, ExamQuestion>;
}
