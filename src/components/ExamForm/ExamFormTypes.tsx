export interface Question {
  key: string;
  question_bank_id: number;
  score: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  collage: string;
  window_start: string;
  window_end: string;
  duration: number;
  category: string;
  questions: Record<string, { question_bank_id: number; score: number }>;
  is_active: number;
}
