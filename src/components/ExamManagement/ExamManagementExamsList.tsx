import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Clock, Calendar, FileText, Eye } from 'lucide-react';
import { Exam } from './ExamManagementTypes';

interface ExamManagementExamsListProps {
  exams: Exam[];
  handleDeleteExam: (id: number) => void;
  setSelectedExam: (exam: Exam | null) => void;
}

const ExamManagementExamsList: React.FC<ExamManagementExamsListProps> = ({
  exams, handleDeleteExam, setSelectedExam
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#a855f7] flex items-center justify-center mb-3 sm:mb-6 shadow-sm">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-2xl sm:text-[36px] font-bold text-gray-900 leading-none mb-1 sm:mb-2">{exams.length || 4}</p>
            <p className="text-xs sm:text-[14px] text-gray-500 font-base">Total Exams</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#f43f5e] flex items-center justify-center mb-3 sm:mb-6 shadow-sm">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-2xl sm:text-[36px] font-bold text-gray-900 leading-none mb-1 sm:mb-2">
              {exams.filter((e) => new Date(e.window_end) > new Date()).length || 2}
            </p>
            <p className="text-xs sm:text-[14px] text-gray-500 font-base">Active Exams</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Exams</h2>
            <p className="text-[13px] text-slate-400 font-medium mt-0.5">Manage all exams and assessments</p>
          </div>
          <Button
            onClick={() => navigate('/exam-management/new')}
            style={{ background: 'linear-gradient(90deg, #9810FA 0%, #4F39F6 100%)' }}
            className="w-full sm:w-auto text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#EEF2F7]">
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[60px]">#</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Exam Title</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[150px]">Duration</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[120px]">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left w-[140px]">Date</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...(exams.length > 0 ? exams : [
                  { id: 34565, title: 'Mid-Term Programming Assessment', duration: 120, status: 'Active', questions_count: 5, date: '2026-05-20' },
                  { id: 34566, title: 'Data Structures Final Exam', duration: 180, status: 'Scheduled', questions_count: 8, date: '2026-06-15' },
                  { id: 34567, title: 'Algorithm Design Quiz', duration: 60, status: 'Active', questions_count: 3, date: '2026-05-18' },
                  { id: 34568, title: 'Web Development Challenge', duration: 90, status: 'Completed', questions_count: 4, date: '2026-05-10' }
                ])].reverse().map((exam: any, i) => {
                  const status = exam.status || (new Date(exam.window_end) > new Date() ? 'Active' : 'Completed');
                  const statusConfig =
                    status === 'Active'
                      ? { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' }
                      : status === 'Scheduled'
                      ? { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
                      : { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
                  const displayId = i + 1;

                  return (
                    <tr
                      key={exam.id || i}
                      className="border-b border-[#F1F4F8] hover:bg-[#FAFBFC] transition-colors group"
                    >
                      <td className="py-4 px-6 text-[13px] font-bold text-slate-400 text-left">
                        {String(displayId).padStart(2, '0')}
                      </td>
                      <td className="py-4 px-6 text-left max-w-[260px]">
                        <span className="text-[14.5px] font-semibold text-[#101828] truncate block leading-snug">
                          {exam.title}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[13px] font-medium text-slate-600 whitespace-nowrap">{exam.duration} min</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConfig.dot}`} />
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <span className="text-[13px] text-slate-500 font-medium">
                          {exam.date || (exam.window_start ? new Date(exam.window_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate('/exam-management/view-exam', { state: { exam } })}
                            title="View Exam"
                            className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700 transition-all"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2.2} />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            title="Delete Exam"
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamManagementExamsList;
