import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ExamQuestion } from './CreateExamTypes';

interface CreateExamQuestionsProps {
  questions: Record<string, ExamQuestion>;
  questionBank: any[];
  totalQuestions: number;
  updateQuestionScore: (key: string, score: number) => void;
  toggleQuestionSelection: (questionId: number) => void;
}

const CreateExamQuestions: React.FC<CreateExamQuestionsProps> = ({
  questions,
  questionBank,
  totalQuestions,
  updateQuestionScore,
  toggleQuestionSelection
}) => {
  return (
    <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
      <CardContent className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-[#1e293b]">Questions</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1">{totalQuestions} question added</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Selected Questions Display */}
          {Object.entries(questions).length === 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border border-slate-200 rounded-[16px] bg-white">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-[14px] bg-[#6366f1] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0 shadow-sm">
                  Q1
                </div>
                <div className="flex-1">
                  <Input
                    readOnly
                    placeholder="Question Bank ID or Text"
                    className="h-12 bg-white border-0 text-[14px] placeholder:text-slate-500 focus-visible:ring-0 px-2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="w-full sm:w-[100px]">
                  <Input
                    placeholder="Marks"
                    className="h-12 bg-white border border-slate-200 text-center text-[14px] rounded-[12px] text-slate-500 w-full"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-12 h-12 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] flex-shrink-0"
                >
                  <Trash2 className="w-[18px] h-[18px] stroke-[1.5]" />
                </Button>
              </div>
            </div>
          )}

          {Object.entries(questions).map(([key, q], idx) => {
            const bankQuestion = questionBank.find((bq) => (bq.question_id || bq.id) === q.question_bank_id);
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border border-slate-200 rounded-[16px] bg-white">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-[14px] bg-[#6366f1] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0 shadow-sm">
                    Q{idx + 1}
                  </div>
                  <div className="flex-1">
                    <Input
                      readOnly
                      value={bankQuestion ? bankQuestion.title : `ID: ${q.question_bank_id}`}
                      className="h-12 bg-white border-0 text-[14px] text-slate-600 focus-visible:ring-0 px-2"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="w-full sm:w-[100px]">
                    <Input
                      type="number"
                      value={q.score}
                      onChange={(e) => updateQuestionScore(key, parseInt(e.target.value) || 0)}
                      className="h-12 bg-white border border-slate-200 text-center text-[14px] rounded-[12px] text-slate-600 w-full"
                      placeholder="Marks"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toggleQuestionSelection(q.question_bank_id)}
                    className="w-12 h-12 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] flex-shrink-0"
                  >
                    <Trash2 className="w-[18px] h-[18px] stroke-[1.5]" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Question Selector */}
          <div className="mt-6 border border-slate-200 rounded-[16px] p-5 bg-white">
            <Label className="text-[14px] font-bold text-[#1e293b] mb-4 block">Select from Question Bank</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {questionBank.length === 0 ? (
                <p className="text-[13px] text-slate-500 p-2">Loading questions...</p>
              ) : (
                questionBank.map((q) => {
                  const qId = q.question_id || q.id;
                  const isSelected = Object.values(questions).some((sq) => sq.question_bank_id === qId);
                  return (
                    <div key={qId} className="flex items-center gap-3 p-3 border border-slate-100 rounded-[12px] hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestionSelection(qId)}
                        className="w-4 h-4 flex-shrink-0 cursor-pointer text-[#6366f1] focus:ring-[#6366f1] transition-all rounded"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-[13px] text-[#1e293b]">{q.title}</p>
                        <p className="text-[12px] text-slate-500 truncate">{q.question}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateExamQuestions;
