import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { NavigationHeaderProps } from './Types';

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ loading, onBack, onSave }) => (
  <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-6 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 space-y-4">
    <Button
      onClick={onBack}
      variant="ghost"
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#7c3aed] bg-[#f3e8ff] hover:bg-[#e9d5ff] hover:text-[#6d28d9] transition-all duration-200 shadow-none font-semibold text-[15px]"
    >
      <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
      <span>Back to Exam</span>
    </Button>

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-[#1e293b] tracking-tight leading-tight">
          Add Question
        </h1>
        <p className="text-sm text-gray-500 mt-1">  
          Create a new question for guest quizzes
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 bg-white border border-gray-200 font-semibold px-6 py-2.5 rounded-xl transition-all"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" strokeWidth={2} />
          )}
          Save Question
        </Button>
      </div>
    </div>
  </div>
);
