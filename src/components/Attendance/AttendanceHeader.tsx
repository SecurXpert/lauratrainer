import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
  showAddForm: boolean;
  editingRecord: any;
  viewMode: string;
  resetForm: () => void;
  setShowAddForm: (val: boolean) => void;
}

export const AttendanceHeader = ({ showAddForm, editingRecord, viewMode, resetForm, setShowAddForm }: Props) => {
  if (showAddForm || editingRecord) return null;
  
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 px-2 md:px-3 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-transparent">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Attendance</h1>
          <p className="text-base text-gray-500">Create a new attendance entry for a student</p>
        </div>
      </div>
      {viewMode === 'list' && (
        <Button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="gap-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white border-none shadow-[0_4px_12px_rgba(99,102,241,0.15)] rounded-2xl h-10 px-4 font-semibold transition-all w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Add Attendance
        </Button>
      )}
    </div>
  );
};
