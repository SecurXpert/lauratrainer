export interface TestCase {
  testcase: number;
  input: string;
  output: string;
}

export interface Question {
  question_id: number;
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: TestCase[];
  suggestion: string[];
}

export interface QuestionForm {
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: { input: string; output: string }[];
  suggestion: string[];
}
