import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExamFormActionsProps {
  loading: boolean;
  isEditMode: boolean;
  handleSubmit: (e: React.FormEvent, saveAsDraft?: boolean) => void;
}

const ExamFormActions: React.FC<ExamFormActionsProps> = ({
  loading, isEditMode, handleSubmit
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/exams')}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={(e) => handleSubmit(e, true)}
        disabled={loading}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save as Draft
      </Button>
      <Button
        type="button"
        onClick={(e) => handleSubmit(e, false)}
        disabled={loading}
        className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      >
        <FilePlus className="h-4 w-4" />
        {loading
          ? isEditMode
            ? 'Updating...'
            : 'Creating...'
          : isEditMode
            ? 'Update Exam'
            : 'Create Exam'}
      </Button>
    </div>
  );
};

export default ExamFormActions;
