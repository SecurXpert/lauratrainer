import React from 'react';

export interface NavigationHeaderProps {
  loading: boolean;
  onBack: () => void;
  onSave: (e: React.FormEvent) => void;
}

export interface QuestionDetailsCardProps {
  examId: string;
  exams: any[];
  title: string;
  questionText: string;
  onChange: (field: string, value: any) => void;
}

export interface AnswerOptionsCardProps {
  solution: string;
  onChange: (field: string, value: any) => void;
}

export interface AdditionalSettingsCardProps {
  points: number | string;
  timeLimit: number | string;
  onChange: (field: string, value: any) => void;
}

export interface QuestionInfoSidebarProps {
  questionType: string;
  correctOption: string;
  points: number | string;
  timeLimit: number | string;
}
