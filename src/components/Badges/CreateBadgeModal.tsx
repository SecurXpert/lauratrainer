import React from 'react';
import { FaAward, FaPlus } from 'react-icons/fa';
import { Course } from './Types';

interface Props {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (v: boolean) => void;
  handleCreateSubmit: (e: React.FormEvent) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  courses: Course[];
  loading: boolean;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CreateBadgeModal = ({ isCreateModalOpen, setIsCreateModalOpen, handleCreateSubmit, selectedCourseId, setSelectedCourseId, courses, loading, formData, handleInputChange }: Props) => {
  if (!isCreateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden border border-white/20">
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm"><FaAward className="w-5 h-5" /></div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight">Create New Badge</h2>
          </div>
          <button onClick={() => setIsCreateModalOpen(false)} className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleCreateSubmit} className="flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Select Course <span className="text-rose-500">*</span></label>
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm cursor-pointer" required disabled={loading || courses.length === 0}>
                  <option value="">-- Select a course --</option>
                  {courses.map((course) => {
                    const title = course.name || course.title || `Course #${course.id}`;
                    return <option key={course.id} value={course.id}>{title.length > 25 ? title.substring(0, 25) + "..." : title} (ID: {course.id})</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Badge Name <span className="text-rose-500">*</span></label>
                <input name="name" value={formData.name} onChange={(e) => { if (e.target.value.length <= 25) handleInputChange(e); }} maxLength={25} required placeholder="e.g. Frontend Master" className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={(e) => { if (e.target.value.length <= 150) handleInputChange(e); }} maxLength={150} rows={3} placeholder="Describe the requirements..." className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none resize-none shadow-sm placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Icon URL</label>
                <input name="icon_url" value={formData.icon_url} onChange={handleInputChange} placeholder="https://example.com/icon.png" className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm placeholder:text-slate-400" />
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[14px] font-semibold text-slate-700 mb-2">Rule (JSON)</label>
                  <textarea name="rule" value={formData.rule} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[13px] font-mono text-slate-600 outline-none resize-none shadow-sm" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-700 mb-2">Additional Props</label>
                  <textarea name="additionalProp1" value={formData.additionalProp1} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[13px] font-mono text-slate-600 outline-none resize-none shadow-sm" />
                </div>
              </div>
              <label className="flex items-center gap-4 p-4 sm:p-5 border border-slate-200 rounded-2xl bg-white cursor-pointer hover:bg-slate-50/50 hover:border-indigo-200 transition-all shadow-sm group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={handleInputChange} name="is_active" className="peer sr-only" />
                  <div className="w-6 h-6 rounded-lg border-2 border-slate-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center bg-white shadow-sm group-hover:border-indigo-400 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/20">
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <div className="flex flex-col"><span className="text-[15px] font-semibold text-slate-800 leading-none mb-1.5">Active Status</span><span className="text-[13.5px] text-slate-500 font-medium leading-snug">Badge will be visible immediately.</span></div>
              </label>
            </div>
          </div>
          <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-5 shrink-0">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-full sm:w-auto h-12 px-6 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-slate-800 font-bold text-[15px] transition-all shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto h-12 px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-[15px] shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 border-0">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span> : <><FaPlus className="w-3.5 h-3.5" /> Create Badge</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
