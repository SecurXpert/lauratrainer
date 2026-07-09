import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Question } from './EditQuizTypes';

interface EditQuizQuestionsProps {
  questions: Question[];
  handleAddQuestion: () => void;
  handleRemoveQuestion: (client_id: string, databaseId?: number) => void;
  handleQuestionChange: (client_id: string, field: keyof Question, value: any) => void;
}

const EditQuizQuestions: React.FC<EditQuizQuestionsProps> = ({
  questions,
  handleAddQuestion,
  handleRemoveQuestion,
  handleQuestionChange
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Questions ({questions.length})
        </h2>
        <Button
          onClick={handleAddQuestion}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-10 rounded-xl px-4 flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={q._client_id}
            className="p-5 bg-[#F8FAFC]/60 rounded-2xl border border-slate-100/80 flex flex-col gap-4 hover:bg-[#F8FAFC] transition duration-150 relative"
          >
            <div className="flex items-start gap-3">
              <div className="text-slate-400 cursor-grab active:cursor-grabbing pt-2 shrink-0">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(q._client_id, "question_text", e.target.value)}
                  placeholder="What is JSX?"
                  className="h-10 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <button
                onClick={() => handleRemoveQuestion(q._client_id, q.id)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0 mt-0.5"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.2fr_1fr] gap-3 pl-10 pr-2">
              <div>
                <select
                  value={q.type}
                  onChange={(e) => handleQuestionChange(q._client_id, "type", e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 focus:outline-none"
                >
                  <option>Multiple Choice</option>
                  <option>True/False</option>
                </select>
              </div>
              <div>
                <select
                  value={q.difficulty}
                  onChange={(e) => handleQuestionChange(q._client_id, "difficulty", e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 focus:outline-none"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={q.points === 0 ? "" : q.points ?? 2}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                    handleQuestionChange(q._client_id, "points", val ? parseInt(val) : 0);
                  }}
                  placeholder="2"
                  className="h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600"
                />
              </div>
            </div>

            {q.type !== "Essay" && (
              <div className="space-y-2.5 pl-10 pr-2">
                {["a", "b", "c", "d"].map((optKey) => {
                  const optField = `option_${optKey}` as keyof Question;
                  const isCorrect = q.correct_option === optKey;

                  if (q.type === "True/False" && (optKey === "c" || optKey === "d")) {
                    return null;
                  }

                  return (
                    <div key={optKey} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuestionChange(q._client_id, "correct_option", optKey)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition shrink-0 ${isCorrect ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                          }`}
                      >
                        {isCorrect && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                      <Input
                        type="text"
                        value={(q[optField] as string) || ""}
                        onChange={(e) => handleQuestionChange(q._client_id, optField, e.target.value)}
                        placeholder={`Option ${optKey.toUpperCase()}`}
                        disabled={q.type === "True/False"}
                        className="h-9 rounded-lg border border-slate-200 bg-white text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditQuizQuestions;
