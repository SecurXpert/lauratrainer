import { Plus, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnswerOptionsCardProps } from "./Types";

export const AnswerOptionsCard = ({
  activeOptions,
  options,
  correctOption,
  setCorrectOption,
  addOption,
  deleteOption,
}: AnswerOptionsCardProps) => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-100/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)",
              boxShadow: "0 8px 20px -4px rgba(59, 95, 235, 0.45)"
            }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-white shrink-0"
          >
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Add Options</h2>
            <p className="text-xs text-slate-400 mt-0.5">Provide multiple choice answers</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={addOption}
          className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-sm font-semibold h-[38px] px-4 rounded-xl border-0 shadow-none flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Option
        </Button>
      </div>

      <div className="space-y-4">
        {/* Options List for Selection & Sync */}
        {options.filter(opt => activeOptions.includes(opt.key)).map((opt) => {
          const isCorrect = correctOption === opt.key;
          return (
            <div key={opt.key} className="flex items-center gap-4 w-full">
              {/* Main Option Card */}
              <div className="flex-1 flex items-center gap-4 bg-[#F8FAFC]/40 p-3 rounded-[16px] border border-[#E2E8F0] hover:bg-[#F8FAFC]/70 transition duration-150">
                {/* Circle badge */}
                <button
                  type="button"
                  onClick={() => setCorrectOption(opt.key)}
                  className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-sm shrink-0 transition duration-150 ${
                    isCorrect
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50/50 shadow-sm"
                      : "border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
                  }`}
                  title="Mark as correct answer"
                >
                  {opt.label}
                </button>
                {/* Input field */}
                <div className="flex-1">
                  <Input
                    type="text"
                    value={opt.val}
                    onChange={(e) => opt.setVal(e.target.value)}
                    placeholder={`Option ${opt.label}`}
                    className="bg-white border border-[#E2E8F0] focus-visible:border-purple-500 rounded-[12px] h-10 px-4 text-sm text-slate-700 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                {/* Correct Answer Badge */}
                {isCorrect && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-100 text-emerald-600 text-xs font-semibold shadow-sm shrink-0">
                    Correct Answer
                  </span>
                )}
              </div>

              {/* Delete button outside card */}
              <button
                type="button"
                onClick={() => deleteOption(opt.key)}
                className="p-3 bg-red-50 text-[#EF4444] hover:bg-red-100 hover:text-[#B91C1C] rounded-[12px] transition duration-150 shrink-0 border-0 flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
