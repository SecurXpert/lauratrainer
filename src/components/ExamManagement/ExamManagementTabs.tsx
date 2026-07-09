import React from 'react';
import { Button } from '@/components/ui/button';

interface ExamManagementTabsProps {
  activeTab: 'questions' | 'exams';
  setActiveTab: (tab: 'questions' | 'exams') => void;
  setQuestionView: (view: 'list' | 'details') => void;
}

const ExamManagementTabs: React.FC<ExamManagementTabsProps> = ({ activeTab, setActiveTab, setQuestionView }) => {
  return (
    <div className="flex w-full sm:w-fit gap-1 sm:gap-2 bg-white rounded-xl p-1.5 shadow-sm mb-6 sm:mb-8 border border-gray-100">
      <Button
        variant="ghost"
        onClick={() => { setActiveTab('questions'); setQuestionView('list'); }}
        className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-lg text-[13px] sm:text-[15px] font-semibold transition-all duration-300 focus:ring-0 focus-visible:ring-0 ${activeTab === 'questions'
          ? 'text-white hover:text-white bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-[0_12px_25px_rgba(124,58,237,0.4)] hover:shadow-[0_14px_30px_rgba(124,58,237,0.5)]'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-none'
          }`}
      >
        Question Bank
      </Button>
      <Button
        variant="ghost"
        onClick={() => setActiveTab('exams')}
        className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-lg text-[13px] sm:text-[15px] font-semibold transition-all duration-300 focus:ring-0 focus-visible:ring-0 ${activeTab === 'exams'
          ? 'text-white hover:text-white bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-[0_12px_25px_rgba(124,58,237,0.4)] hover:shadow-[0_14px_30px_rgba(124,58,237,0.5)]'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-none'
          }`}
      >
        Exams
      </Button>
    </div>
  );
};

export default ExamManagementTabs;
