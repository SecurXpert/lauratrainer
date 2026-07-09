import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import { AnswerOptionsCardProps } from './Types';

export const AnswerOptionsCard: React.FC<AnswerOptionsCardProps> = ({ solution, onChange }) => (
  <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Answer Options</h3>
          <p className="text-[13px] text-gray-500 font-medium">Essay response</p>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <Label className="text-[14px] font-semibold text-gray-800">Expected Answer / Rubric <span className="text-red-500">*</span></Label>
        <textarea
          maxLength={300}
          value={solution}
          onChange={(e) => onChange('solution', e.target.value)}
          placeholder="Provide a model answer or grading rubric for this essay question..."
          className="w-full h-32 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all text-[14px] resize-none"
        />
        <p className="text-[12px] text-gray-500 font-medium mt-2 text-right">
          Students will write a text response. No multiple choice options are required.
        </p>
      </div>
    </CardContent>
  </Card>
);
