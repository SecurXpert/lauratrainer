import React from 'react';

interface CreateExamSummaryProps {
  totalQuestions: number;
  totalMarks: number;
  duration: string;
  window_start: string;
}

const CreateExamSummary: React.FC<CreateExamSummaryProps> = ({
  totalQuestions,
  totalMarks,
  duration,
  window_start
}) => {
  return (
    <div className="bg-[#eef2ff] border border-[#bfdbfe] rounded-[16px] p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 mt-8 sm:mt-12 mb-8">
      <div className="flex-1 w-full">
        <h3 className="text-[18px] font-bold text-[#1e293b] mb-6 sm:mb-8">Exam Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
          <div>
            <p className="text-[13px] font-medium text-slate-500 mb-2">Total Questions</p>
            <p className="text-[20px] font-bold text-[#1e293b]">{totalQuestions}</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-500 mb-2">Total Marks</p>
            <p className="text-[20px] font-bold text-[#1e293b]">{totalMarks}</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-500 mb-2">Duration</p>
            <p className="text-[20px] font-bold text-[#1e293b]">{duration || '0'} min</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-500 mb-2">Exam Window</p>
            <p className="text-[14px] font-medium text-[#1e293b] break-words">
              {window_start ? new Date(window_start.split('T')[0]).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExamSummary;
