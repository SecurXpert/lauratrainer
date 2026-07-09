import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationHeaderProps } from "./Types";

export const NavigationHeader = ({ addingQuestion, onCancel, onSave }: NavigationHeaderProps) => {
  return (
    <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-6 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 space-y-4">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 px-6 py-2.5  hover:bg-[#E5DBFF] text-[#7C3AED] font-semibold text-sm rounded-lg transition duration-150 cursor-pointer border-0 shadow-none"
      >
        <ArrowLeft className="w-4 h-4 text-[#7C3AED]" />
        Back to Guest Quizzes
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
              Add Question
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a new question for guest quizzes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={addingQuestion}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 text-[16px]"
          >
            {addingQuestion ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" strokeWidth={2} />
            )}
            Save Question
          </Button>
        </div>
      </div>
    </div>
  );
};
