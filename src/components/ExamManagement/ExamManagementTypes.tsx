export interface TestCase {
  testcase: number;
  input: string;
  output: string;
}

export interface QuestionBankItem {
  id: number;
  question_id?: number;
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: TestCase[];
  suggestion: string[];
}

export interface ExamQuestion {
  question_bank_id: number;
  score: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  course_id: number;
  window_start: string;
  window_end: string;
  duration: number;
  category: string;
  questions: Record<string, ExamQuestion>;
}
