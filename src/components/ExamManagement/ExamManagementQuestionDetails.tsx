import React from 'react';
import { X, Code, ClipboardList, Lightbulb, List } from 'lucide-react';
import { QuestionBankItem } from './ExamManagementTypes';

interface ExamManagementQuestionDetailsProps {
  selectedBankQuestion: QuestionBankItem;
  setQuestionView: (view: 'list' | 'details') => void;
}

const ExamManagementQuestionDetails: React.FC<ExamManagementQuestionDetailsProps> = ({
  selectedBankQuestion, setQuestionView
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#6366f1] rounded-[24px] p-8 flex flex-col relative text-white shadow-sm">
        <button
          onClick={() => setQuestionView('list')}
          className="absolute top-8 left-8 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="ml-16">
          <h2 className="text-[28px] font-bold tracking-tight">{selectedBankQuestion.title}</h2>
          <p className="text-[14px] text-indigo-100 font-medium mt-1">Question Details</p>
        </div>
      </div>

      <div className="flex gap-2 px-2">
        <span className="px-4 py-1.5 bg-[#dcfce7] text-[#166534] rounded-full text-[13px] font-bold">Easy</span>
        <span className="px-4 py-1.5 bg-[#e0e7ff] text-[#3730a3] rounded-full text-[13px] font-bold">Arrays</span>
      </div>

      <div className="px-2">
        <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4">
          <Code className="w-5 h-5 mr-2 text-[#9333ea]" />
          Problem Statement
        </h3>
        <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-6 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
          {selectedBankQuestion.question || "No problem statement provided."}
        </div>
      </div>

      {selectedBankQuestion.test_cases?.length > 0 && (
        <div className="px-2">
          <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4 mt-8">
            <ClipboardList className="w-5 h-5 mr-2 text-[#16a34a]" />
            Test Cases
          </h3>
          <div className="space-y-4">
            {selectedBankQuestion.test_cases.map((tc, idx) => (
              <div key={idx} className="bg-[#f0fdf4] border border-[#dcfce7] rounded-[20px] p-6">
                <p className="text-[13px] font-bold text-gray-800 mb-4">Test Case {idx + 1}</p>
                <div className="space-y-3">
                  <div className="bg-white border border-[#dcfce7] rounded-xl p-4 text-[14px] font-mono text-gray-800 shadow-sm">
                    <span className="text-gray-400 text-[12px] block mb-1.5 font-sans font-medium">Input:</span>
                    {tc.input}
                  </div>
                  <div className="bg-white border border-[#dcfce7] rounded-xl p-4 text-[14px] font-mono text-gray-800 shadow-sm">
                    <span className="text-gray-400 text-[12px] block mb-1.5 font-sans font-medium">Output:</span>
                    {tc.output}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBankQuestion.suggestion?.length > 0 && selectedBankQuestion.suggestion[0] !== '' && (
        <div className="px-2">
          <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4 mt-8">
            <Lightbulb className="w-5 h-5 mr-2 text-[#f59e0b]" />
            Suggestions
          </h3>
          <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-[20px] p-6">
            <div className="space-y-4">
              {selectedBankQuestion.suggestion.map((sug, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#fed7aa] text-[#c2410c] flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed font-medium">{sug}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-2 mb-8">
        <h3 className="flex items-center text-[16px] font-bold text-gray-900 mb-4 mt-8">
          <List className="w-5 h-5 mr-2 text-gray-700" />
          Constraints
        </h3>
        <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-6">
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
              <code className="text-[13px] text-[#9333ea] bg-purple-50 px-2 py-1 rounded-md font-mono">2 &lt;= nums.length &lt;= 10^4</code>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
              <code className="text-[13px] text-[#9333ea] bg-purple-50 px-2 py-1 rounded-md font-mono">-10^9 &lt;= nums[i] &lt;= 10^9</code>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
              <code className="text-[13px] text-[#9333ea] bg-purple-50 px-2 py-1 rounded-md font-mono">-10^9 &lt;= target &lt;= 10^9</code>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></div>
              <span className="text-[14px] text-gray-700 font-medium">Only one valid answer exists.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExamManagementQuestionDetails;
