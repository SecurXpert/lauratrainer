import React from 'react';

interface EditQuizStatsProps {
  questionsCount: number;
  totalPoints: number;
  duration: string;
}

const EditQuizStats: React.FC<EditQuizStatsProps> = ({ questionsCount, totalPoints, duration }) => {
  return (
    <div className="bg-[#F4F7FF] rounded-2xl border border-blue-100/30 p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Quick Stats</h2>
      <div className="space-y-3.5 text-sm font-medium">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Total Questions</span>
          <span className="text-slate-900 font-bold">{questionsCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Total Points</span>
          <span className="text-slate-900 font-bold">{totalPoints}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Est. Duration</span>
          <span className="text-slate-900 font-bold">{duration || 0} min</span>
        </div>
      </div>
    </div>
  );
};

export default EditQuizStats;
