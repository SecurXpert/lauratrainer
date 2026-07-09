import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Check } from 'lucide-react';
import { QuestionInfoSidebarProps } from './Types';

export const QuestionInfoSidebar: React.FC<QuestionInfoSidebarProps> = ({
  questionType,
  correctOption,
  points,
  timeLimit,
}) => (
  <Card className="bg-[#f8fafc] border border-indigo-50 shadow-sm rounded-2xl sticky top-6">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-sm">
          <HelpCircle className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Question Info</h3>
      </div>
      <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {questionType !== 'Essay' && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-[14px] text-gray-500 font-medium">Options</span>
              <span className="text-[15px] font-bold text-gray-900">
                {questionType === 'True/False' ? '2' : '4'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-[14px] text-gray-500 font-medium">Correct Answer</span>
              <span className="text-[15px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">Option {correctOption.toUpperCase()}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-[14px] text-gray-500 font-medium">Points</span>
          <span className="text-[15px] font-bold text-gray-900">{points}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-[14px] text-gray-500 font-medium">Time Limit</span>
          <span className="text-[15px] font-bold text-gray-900">{timeLimit ? `${timeLimit}m` : ''}</span>
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Tips:</h4>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2 text-[13px] text-gray-600 font-medium">
            <Check className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
            Keep questions clear and concise
          </li>
          <li className="flex items-start gap-2 text-[13px] text-gray-600 font-medium">
            <Check className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
            Ensure only one correct answer
          </li>
          <li className="flex items-start gap-2 text-[13px] text-gray-600 font-medium">
            <Check className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
            Avoid ambiguous wording
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
);
