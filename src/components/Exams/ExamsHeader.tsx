import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExamsHeaderProps {
  fetching: boolean;
  fetchExams: () => void;
}

const ExamsHeader: React.FC<ExamsHeaderProps> = ({ fetching, fetchExams }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-7">
      <div>
        <h1 className="text-[30px] font-bold text-[#111827]">Exams</h1>
        <p className="text-[#64748B]">Create, manage and monitor all examinations</p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={fetchExams}
          variant="outline"
          disabled={fetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={() => navigate('/exams/new')}
          className="h-10 px-5 rounded-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium shadow-[0_10px_22px_rgba(126,58,242,0.35)] flex"
        >
          <Plus className="h-4 w-4" />
          Create New Exam
        </Button>
      </div>
    </div>
  );
};

export default ExamsHeader;
