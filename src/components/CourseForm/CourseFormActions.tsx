import React from 'react';
import { Button } from "@/components/ui/button";

interface CourseFormActionsProps {
  loading: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CourseFormActions: React.FC<CourseFormActionsProps> = ({ loading, isEdit, onCancel, onSubmit }) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 pb-8">
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-[14px] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-0"
      >
        {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="h-11 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[14px] rounded-xl shadow-sm transition-all"
      >
        Cancel
      </Button>
    </div>
  );
};

export default CourseFormActions;
