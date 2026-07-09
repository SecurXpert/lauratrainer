import React from 'react';
import { Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PerformancereviewEditModalProps {
  editingId: number;
  setEditingId: (val: number | null) => void;
  editText: string;
  setEditText: (val: string) => void;
  loading: boolean;
  handleUpdate: (id: number) => void;
}

const PerformancereviewEditModal: React.FC<PerformancereviewEditModalProps> = ({
  editingId, setEditingId, editText, setEditText, loading, handleUpdate
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden border border-white/20">
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Pencil className="w-5 h-5" />
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight">Edit Review</h2>
          </div>
          <button
            onClick={() => setEditingId(null)}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <Label className="block text-[14px] font-semibold text-slate-700 mb-2">Review Feedback <span className="text-rose-500">*</span></Label>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Update your review..."
                  className="w-full min-h-[140px] px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm resize-none"
                  maxLength={350}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-5 shrink-0">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="w-full sm:w-auto h-12 px-6 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-slate-800 font-bold text-[15px] transition-all shadow-sm"
            >
              Cancel
            </button>

            <button
              onClick={() => handleUpdate(editingId)}
              disabled={loading || !editText}
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white rounded-xl font-bold text-[15px] shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2.5 border-0"
            >
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancereviewEditModal;
