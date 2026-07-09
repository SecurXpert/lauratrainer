import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateExamHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#6366f1] text-white py-6 px-10 relative">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Create New Exam</h1>
        <p className="text-indigo-100 text-[14px]">Fill in the details to schedule a new examination</p>
        <button
          type="button"
          onClick={() => navigate('/exam-management', { state: { activeTab: 'exams' } })}
          className="absolute top-6 right-8 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default CreateExamHeader;
