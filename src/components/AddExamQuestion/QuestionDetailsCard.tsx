import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileCode } from 'lucide-react';
import { QuestionDetailsCardProps } from './Types';

export const QuestionDetailsCard: React.FC<QuestionDetailsCardProps> = ({
  examId,
  exams,
  title,
  questionText,
  onChange,
}) => (
  <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <FileCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Question Details</h3>
          <p className="text-[13px] text-gray-500 font-medium">Question text and type</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Select Exam <span className="text-red-500">*</span></Label>
          <select
            value={examId}
            onChange={(e) => onChange('exam_id', e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-[14px]"
            required
          >
            <option value="">Select an Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-[14px] font-semibold text-gray-800">Question <span className="text-red-500">*</span></Label>
          </div>
          <Input
            value={title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g., Prime Number Checker"
            className="h-11 rounded-xl bg-gray-50 border-gray-200 text-[14px]"
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Description <span className="text-red-500">*</span></Label>
          <textarea
            value={questionText}
            onChange={(e) => onChange('question_text', e.target.value)}
            placeholder="Enter your question here..."
            className="w-full h-32 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-[14px] resize-none"
            required
            // maxLength={5000}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);
