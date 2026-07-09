import { Tag } from "lucide-react";
import { QuestionInfoSidebarProps } from "./Types";

export const QuestionInfoSidebar = ({ activeOptionsLength, correctOption }: QuestionInfoSidebarProps) => {
  return (
    <>
      {/* Question Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)",
              boxShadow: "0 8px 20px -4px rgba(59, 95, 235, 0.45)"
            }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-white shrink-0"
          >
            <Tag className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Question Info</h2>
        </div>

        <div className="space-y-4 text-sm font-medium">

          {/* Type Display */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Type</span>
            <span className="h-8 flex items-center justify-center rounded-lg bg-blue-50 px-2.5 text-xs font-bold text-blue-600">
              Multiple Choice
            </span>
          </div>
          {/* Options Count */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Options</span>
            <span className="text-slate-900 font-bold">
              {activeOptionsLength}
            </span>
          </div>

          {/* Correct Answer badge */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Correct Answer</span>
            <span className="text-slate-950 font-bold text-base">
              {correctOption ? correctOption.toUpperCase() : "—"}
            </span>
          </div>

        </div>
      </div>

      {/* Quick Tips Container */}
      <div className="bg-[#F4F7FF] rounded-2xl border border-blue-100/30 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quick Tips:</h3>
        <ul className="space-y-3.5 text-sm font-medium text-slate-600">
          <li className="flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <span>Keep questions clear and concise</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <span>Ensure only one correct answer</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <span>Avoid ambiguous wording</span>
          </li>
        </ul>
      </div>
    </>
  );
};
