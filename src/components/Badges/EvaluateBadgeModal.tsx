import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { Badge, Student } from './Types';

interface Props {
  isEvaluateModalOpen: boolean;
  setIsEvaluateModalOpen: (v: boolean) => void;
  handleEvaluateSubmit: (e: React.FormEvent) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  selectedBadgeIdForEval: string;
  setSelectedBadgeIdForEval: (id: string) => void;
  loading: boolean;
  students: Student[];
  badges: Badge[];
}

export const EvaluateBadgeModal = ({ isEvaluateModalOpen, setIsEvaluateModalOpen, handleEvaluateSubmit, selectedStudentId, setSelectedStudentId, selectedBadgeIdForEval, setSelectedBadgeIdForEval, loading, students, badges }: Props) => {
  if (!isEvaluateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden border border-white/20">
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm"><FaCheckCircle className="w-5 h-5" /></div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight">Evaluate Badge</h2>
          </div>
          <button onClick={() => setIsEvaluateModalOpen(false)} className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleEvaluateSubmit} className="flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Select Student <span className="text-rose-500">*</span></label>
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required disabled={loading || !Array.isArray(students) || students.length === 0} className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400">
                  <option value="">-- Select a student --</option>
                  {Array.isArray(students) && students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name || student.username || student.email || `Student #${student.id}`}</option>
                  ))}
                </select>
                {(!Array.isArray(students) || students.length === 0) && <p className="text-[13px] text-rose-500 font-medium mt-2">No students found.</p>}
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Select Badge <span className="text-rose-500">*</span></label>
                <select value={selectedBadgeIdForEval} onChange={(e) => setSelectedBadgeIdForEval(e.target.value)} required disabled={loading || badges.length === 0} className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400">
                  <option value="">-- Select a badge --</option>
                  {badges.map((badge) => <option key={badge.id} value={badge.id}>{badge.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-5 shrink-0">
            <button type="button" onClick={() => setIsEvaluateModalOpen(false)} className="w-full sm:w-auto h-12 px-6 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-slate-800 font-bold text-[15px] transition-all shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto h-12 px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-[15px] shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 border-0">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating...</span> : <><FaCheckCircle className="w-3.5 h-3.5" /> Evaluate</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
