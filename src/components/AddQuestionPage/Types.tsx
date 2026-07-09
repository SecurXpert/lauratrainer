export interface Quiz {
  id: number;
  title: string;
}

export interface OptionItem {
  key: string;
  label: string;
  val: string;
  setVal: (val: string) => void;
}

export interface NavigationHeaderProps {
  addingQuestion: boolean;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
}

export interface QuestionDetailsCardProps {
  quizzes: Quiz[];
  selectedQuizId: string;
  setSelectedQuizId: (val: string) => void;
  questionText: string;
  setQuestionText: (val: string) => void;
  activeOptions: string[];
  options: OptionItem[];
  correctOption: string;
  onCorrectOptionTextChange: (val: string) => void;
}

export interface AnswerOptionsCardProps {
  activeOptions: string[];
  options: OptionItem[];
  correctOption: string;
  setCorrectOption: (val: string) => void;
  addOption: () => void;
  deleteOption: (key: string) => void;
}

export interface QuestionInfoSidebarProps {
  activeOptionsLength: number;
  correctOption: string;
}
