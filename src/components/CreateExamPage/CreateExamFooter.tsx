import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CreateExamFooterProps {
  loading: boolean;
}

const CreateExamFooter: React.FC<CreateExamFooterProps> = ({ loading }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-end border-t border-slate-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
      <div className="flex w-full sm:w-auto gap-4">
        <Button
          type="submit"
          form="create-exam-form"
          className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-[14px] font-medium h-[52px] px-8 shadow-sm text-[15px] w-full"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Exam'}
        </Button>
      </div>
    </div>
  );
};

export default CreateExamFooter;
