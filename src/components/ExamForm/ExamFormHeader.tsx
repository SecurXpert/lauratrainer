import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExamFormHeaderProps {
  isEditMode: boolean;
}

const ExamFormHeader: React.FC<ExamFormHeaderProps> = ({ isEditMode }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="outline" onClick={() => navigate('/exams')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit New Exam' : 'Create New Exam'}
        </h1>
        <p className="text-sm text-gray-500">
          {isEditMode ? 'Update the details to schedule a examination' : 'Fill in the details to schedule a new examination'}
        </p>
      </div>
    </div>
  );
};

export default ExamFormHeader;
