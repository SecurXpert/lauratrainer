import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode, Plus, Eye, Trash2 } from 'lucide-react';
import { QuestionBankItem } from './ExamManagementTypes';

interface ExamManagementQuestionsListProps {
  questionBank: QuestionBankItem[];
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  handleDeleteQuestion: (id: number) => void;
}

const ExamManagementQuestionsList: React.FC<ExamManagementQuestionsListProps> = ({
  questionBank, currentPage, setCurrentPage, itemsPerPage, handleDeleteQuestion
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#2B7FFF] to-[#00B8DB] flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
              <FileCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-2xl sm:text-[32px] font-bold text-gray-900 leading-none mb-1 sm:mb-2">{questionBank.length}</p>
            <p className="text-xs sm:text-[14px] text-gray-400 font-medium">Total Questions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">Question Bank</h2>
            <p className="text-[13px] sm:text-[15px] text-gray-500 font-base mt-1">Manage all coding questions</p>
          </div>
          <Button
            onClick={() => navigate('/exam-management/add-question')}
            style={{ background: 'linear-gradient(90deg, #9810FA 0%, #4F39F6 100%)' }}
            className="w-full sm:w-auto text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-300 hover:brightness-110 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Add Question
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar pb-3">
            <table className="table-fixed w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-left w-[80px]">ID</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-left w-[250px]">Question Title</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-left w-[150px]">Description</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-[140px]">Last Modified</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-auto">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const reversedQuestions = [...questionBank].reverse();
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const currentQuestions = reversedQuestions.slice(startIndex, startIndex + itemsPerPage);

                  return (
                    <>
                      {currentQuestions.map((q, i) => {
                        const lastModified = (q as any).created_at
                          ? new Date((q as any).created_at).toLocaleDateString('en-CA')
                          : new Date().toLocaleDateString('en-CA');

                        const qId = q.question_id || q.id;
                        const displayId = startIndex + i + 1;

                        return (
                          <tr key={qId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                            <td className="py-5 px-6 text-[14px] font-semibold text-gray-900 text-left">{displayId}</td>
                            <td className="py-5 px-6 text-[15px] font-semibold text-[#101828] text-left truncate">{q.title}</td>
                            <td className="py-5 px-6 text-[14.5px] text-gray-600 font-normal text-left max-w-[250px]">
                              <div className="h-[40px] overflow-hidden whitespace-normal break-words leading-[20px]">
                                {q.question || q.description || 'No description provided.'}
                              </div>
                            </td>
                            <td className="py-5 px-6 text-[14px] text-gray-500 font-normal text-center">
                              {lastModified}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <div className="flex items-center justify-center gap-4 whitespace-nowrap">
                                <button
                                  onClick={() => navigate('/exam-management/view-question', { state: { question: q, questionId: qId } })}
                                  className="flex items-center text-[#7c3aed] hover:text-[#6d28d9] font-semibold text-[14.5px] transition-colors"
                                >
                                  <Eye className="w-4 h-4" strokeWidth={2} />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(qId)}
                                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all flex items-center justify-center"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
          {(() => {
            const totalPages = Math.ceil(questionBank.length / itemsPerPage);
            if (totalPages <= 1) return null;

            return (
              <div className="flex justify-center items-center gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-[14px] font-bold transition-all ${currentPage === i + 1
                        ? "bg-[#5850EC] text-white shadow-sm"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-500 rounded-xl text-[14px] font-medium border border-slate-200 shadow-sm transition-all"
                >
                  Next
                </button>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </>
  );
};

export default ExamManagementQuestionsList;
