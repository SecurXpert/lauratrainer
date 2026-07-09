import { ArrowLeft, GraduationCap, Clock, Calendar, User, Save, X, Info, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const AttendanceForm = ({ 
  editingRecord, resetForm, courseId, setSearchParams, courses, 
  formData, setFormData, allStudents, formDate, setFormDate, 
  formCheckIn, setFormCheckIn, formCheckOut, setFormCheckOut, 
  durationText, handleAdd, handleEdit, loading 
}: any) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  return (
    <div className="animate-fade-in mb-8">
      <button onClick={resetForm} className="group flex items-center gap-2 text-slate-500 hover:text-[#3b82f6] text-sm font-semibold transition-all mb-6 px-3 py-1.5 rounded-lg hover:bg-blue-50 -ml-3">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Attendance
      </button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}</h1>
        <p className="text-slate-500 mt-1">{editingRecord ? 'Modify an existing attendance entry' : 'Create a new attendance entry for a student'}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-8">
            <CardContent className="p-0 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><GraduationCap className="w-4 h-4 text-[#8b5cf6]" /> Select Course *</label>
                <div className="relative">
                  <select value={courseId} onChange={(e) => setSearchParams({ course_id: e.target.value })} disabled={!!editingRecord} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer">
                    <option value="" disabled>Select Course</option>
                    {courses.map((c: any) => <option key={c.id} value={c.id.toString()}>{c.title ? `${c.title} (ID: ${c.id})` : `Course ID: ${c.id}`}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><User className="w-4 h-4 text-[#8b5cf6]" /> Select Student *</label>
                <div className="relative">
                  <select value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} disabled={!!editingRecord} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer">
                    <option value="" disabled>Select Student</option>
                    {allStudents.map((s: any) => <option key={s.id} value={s.id.toString()}>{s.name} (ID: {s.id})</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Calendar className="w-4 h-4 text-[#8b5cf6]" /> Date *</label>
                <input type="date" max={todayStr} value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all cursor-pointer" />
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2"><Clock className="w-3.5 h-3.5" /> Cannot select future dates</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Clock className="w-4 h-4 text-[#10B981]" /> Check-in Time *</label>
                  <input type="time" value={formCheckIn} onChange={e => setFormCheckIn(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all cursor-pointer" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Clock className="w-4 h-4 text-[#EF4444]" /> Check-out Time *</label>
                  <input type="time" value={formCheckOut} onChange={e => setFormCheckOut(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8b5cf6] text-sm transition-all cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Clock className="w-4 h-4 text-[#8b5cf6]" /> Duration (Auto-calculated)</label>
                <input type="text" readOnly value={durationText || 'Duration will be calculated automatically'} className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-slate-500 text-sm focus:outline-none" />
                <p className="text-xs text-slate-400 mt-2">Based on check-in and check-out times</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                <Button onClick={editingRecord ? handleEdit : handleAdd} disabled={loading} className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(99,102,241,0.15)] flex items-center justify-center gap-2 border-none h-12">
                  <Save className="w-4 h-4" /> Save Attendance
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1 border border-gray-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 h-12">
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-6">
            <div className="flex items-center gap-2 mb-4 text-violet-600"><Info className="w-5 h-5" /><h3 className="font-bold text-slate-800 text-base">Quick Tips</h3></div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /> Select the student from the dropdown to view their details</li>
              <li className="flex items-start gap-2.5 text-sm text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /> Date cannot be in the future</li>
              <li className="flex items-start gap-2.5 text-sm text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /> Duration is calculated automatically from times</li>
              <li className="flex items-start gap-2.5 text-sm text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /> Status is auto-detected but can be changed manually</li>
              <li className="flex items-start gap-2.5 text-sm text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /> Check-out time must be after check-in time</li>
            </ul>
          </Card>
          <Card className="rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-6">
            <h3 className="font-bold text-slate-800 text-base mb-4">Standard Times</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl"><span className="text-sm font-semibold text-emerald-800">Check-in</span><span className="text-sm font-bold text-emerald-700">9:00 AM</span></div>
              <div className="flex items-center justify-between p-3 bg-rose-50/70 border border-rose-100 rounded-xl"><span className="text-sm font-semibold text-rose-800">Check-out</span><span className="text-sm font-bold text-rose-700">5:00 PM</span></div>
              <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-100 rounded-xl"><span className="text-sm font-semibold text-amber-800">Late After</span><span className="text-sm font-bold text-amber-700">9:15 AM</span></div>
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-xl"><span className="text-sm font-semibold text-blue-800">Expected Duration</span><span className="text-sm font-bold text-blue-700">8 hours</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
