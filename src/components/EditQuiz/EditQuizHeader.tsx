import React from 'react';
import { ArrowLeft, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EditQuizHeaderProps {
  id: string | undefined;
  submitting: boolean;
  handleSave: () => void;
}

const EditQuizHeader: React.FC<EditQuizHeaderProps> = ({ id, submitting, handleSave }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-slate-200/80 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/quizzes`)}
          className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
            Edit Quiz
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Modify quiz details and questions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/quizzes/${id}/view`)}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={submitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Award className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditQuizHeader;
