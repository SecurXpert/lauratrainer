import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuestionDetailsCardProps } from "./Types";

export const QuestionDetailsCard = ({
  quizzes,
  selectedQuizId,
  setSelectedQuizId,
  questionText,
  setQuestionText,
  activeOptions,
  options,
  correctOption,
  onCorrectOptionTextChange,
}: QuestionDetailsCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)",
            boxShadow: "0 8px 20px -4px rgba(59, 95, 235, 0.45)"
          }}
          className="w-11 h-11 rounded-[16px] flex items-center justify-center text-white shrink-0"
        >
          <HelpCircle className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Question Details</h2>
          <p className="text-xs text-slate-400">Question text and type</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Quiz ID / Select Quiz */}
        <div>
          <Label className="text-sm font-semibold text-slate-700">Quiz ID</Label>
          {quizzes.length > 0 ? (
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full mt-2 h-11 rounded-xl bg-slate-50 border-0 px-3 text-sm focus:outline-none transition cursor-pointer"
            >
              <option value="">Select a Quiz</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} (ID: {q.id})
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              maxLength={6}
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value.replace(/\D/g, ''))}
              placeholder="Quiz id"
              className="mt-2 h-11 rounded-xl bg-slate-50 border-0 transition"
            />
          )}
        </div>

        {/* Question Text */}
        <div>
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold text-slate-700">Question <span className="text-red-500">*</span></Label>
          </div>
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question here..."
            rows={4}
            maxLength={180}
            className="mt-2 rounded-xl bg-slate-50 border-0 resize-none transition"
          />
        </div>

        {/* Option Inputs A, B, C, D, E, F */}
        <div className="space-y-3">
          {options.filter(opt => activeOptions.includes(opt.key)).map((opt) => (
            <div key={opt.key} className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                {opt.label}
              </div>
              <Input
                type="text"
                value={opt.val}
                onChange={(e) => opt.setVal(e.target.value)}
                placeholder={`Option ${opt.label}`}
                className="bg-transparent border-0 h-9 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm shadow-none"
              />
            </div>
          ))}
        </div>

        {/* Correct Option text box */}
        <div>
          <Label className="text-sm font-semibold text-slate-700">Correct Option (A-{activeOptions[activeOptions.length - 1].toUpperCase()})</Label>
          <Input
            type="text"
            value={correctOption.toUpperCase()}
            onChange={(e) => onCorrectOptionTextChange(e.target.value)}
            placeholder={`Correct option (A-${activeOptions[activeOptions.length - 1].toUpperCase()})`}
            className="mt-2 h-11 rounded-xl bg-slate-50 border-0 transition"
            maxLength={1}
          />
        </div>

      </div>
    </div>
  );
};
