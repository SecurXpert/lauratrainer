import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Question } from './ExamFormTypes';

interface ExamFormQuestionsProps {
  questions: Question[];
  addQuestion: () => void;
  updateQuestion: (key: string, field: 'question_bank_id' | 'score', value: string) => void;
  removeQuestion: (key: string) => void;
}

const ExamFormQuestions: React.FC<ExamFormQuestionsProps> = ({
  questions, addQuestion, updateQuestion, removeQuestion
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">Questions</CardTitle>
          <Button type="button" onClick={addQuestion} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((q, index) => (
          <div
            key={q.key}
            className="grid grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg border"
          >
            <div className="col-span-1 flex items-center justify-center">
              <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
            </div>
            <div className="col-span-6 space-y-1">
              <Label className="text-xs text-gray-500">Question Bank ID or Question Text</Label>
              <Input
                type="number"
                min="1"
                value={q.question_bank_id}
                onChange={(e) => updateQuestion(q.key, 'question_bank_id', e.target.value)}
                placeholder="Enter ID"
              />
            </div>
            <div className="col-span-4 space-y-1">
              <Label className="text-xs text-gray-500">Marks</Label>
              <Input
                type="number"
                min="1"
                value={q.score}
                onChange={(e) => updateQuestion(q.key, 'score', e.target.value)}
                placeholder="Marks"
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(q.key)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExamFormQuestions;
