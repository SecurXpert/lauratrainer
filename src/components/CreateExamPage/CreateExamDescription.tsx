import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CreateExamDescriptionProps {
  description: string;
  handleExamFormChange: (field: string, value: any) => void;
}

const CreateExamDescription: React.FC<CreateExamDescriptionProps> = ({
  description,
  handleExamFormChange
}) => {
  return (
    <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
      <CardContent className="p-4 sm:p-8">
        <h3 className="text-[18px] font-bold text-[#1e293b] mb-5">Description</h3>
        <div className="space-y-3">
          <textarea
            className="w-full border border-slate-200 p-4 rounded-[14px] min-h-[120px] bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] resize-none text-[15px] text-slate-900 font-medium placeholder:text-slate-400 transition-all"
            placeholder="Provide a brief description about this exam..."
            value={description}
            maxLength={200}
            onChange={(e) => handleExamFormChange('description', e.target.value)}
          />
          <p className="text-[13px] text-slate-500 font-medium">
            This description will be visible to students when they view the exam
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateExamDescription;
