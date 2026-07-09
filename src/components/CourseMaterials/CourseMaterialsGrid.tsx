import React from 'react';
import { Loader2, FileText, Video, Eye, Edit, Download, Trash2 } from "lucide-react";
import { Material } from './CourseMaterialsTypes';

interface CourseMaterialsGridProps {
  loadingMaterials: boolean;
  materialsLength: number;
  selectedCourseId: string;
  paginatedMaterials: Material[];
  courses: any[];
  loadingAction: boolean;
  handleView: (url: string) => void;
  handleEdit: (material: Material) => void;
  handleDownload: (url: string, filename: string) => void;
  handleDelete: (id: number) => void;
}

const CourseMaterialsGrid: React.FC<CourseMaterialsGridProps> = ({
  loadingMaterials,
  materialsLength,
  selectedCourseId,
  paginatedMaterials,
  courses,
  loadingAction,
  handleView,
  handleEdit,
  handleDownload,
  handleDelete
}) => {
  if (loadingMaterials) {
    return (
      <div className="p-20 text-center text-slate-400 bg-white rounded-2xl border">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="font-medium">Loading materials...</p>
      </div>
    );
  }

  if (materialsLength === 0) {
    return (
      <div className="p-20 text-center text-slate-400 bg-white rounded-2xl border">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="font-medium text-slate-500">
          {selectedCourseId ? "No materials uploaded yet for this course." : "No materials available across any course."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {paginatedMaterials.map((mat) => {
        const isVideo = mat.file_url?.toLowerCase().endsWith('.mp4');
        const courseTitle = mat.course_title || courses.find(c => String(c.id) === String(selectedCourseId))?.title || "Unknown Course";

        return (
          <div
            key={mat.id}
            className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isVideo ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {isVideo ? <Video className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-lg leading-snug truncate group-hover:text-blue-600 transition-colors">
                    {mat.title}
                  </h3>
                  <p className="text-slate-500 text-[14px] mt-1">{courseTitle}</p>
                  <div className="flex items-center gap-3 mt-3 text-[13px] text-slate-500 font-medium">
                    <span>{mat.created_at ? new Date(mat.created_at).toISOString().split('T')[0] : '2026-03-20'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-white border-t border-slate-200/70 flex items-center gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] rounded-2xl text-[14px] font-semibold transition-all border border-slate-200/40 shadow-sm"
                onClick={() => mat.file_url && handleView(mat.file_url)}
              >
                <Eye className="w-[18px] h-[18px] text-[#334155]" />
                View
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] rounded-2xl text-[14px] font-semibold transition-all border border-blue-100/40 shadow-sm"
                onClick={() => handleEdit(mat)}
              >
                <Edit className="w-[18px] h-[18px] text-[#2563EB]" />
                Edit
              </button>
              <button
                className="w-12 h-10 flex items-center justify-center rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] transition-all border border-slate-200/40 shadow-sm shrink-0"
                onClick={() => mat.file_url && handleDownload(mat.file_url, mat.title)}
                title="Download"
              >
                <Download className="w-[18px] h-[18px] text-[#334155]" />
              </button>
              <button
                className="w-12 h-10 flex items-center justify-center rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] transition-all border border-red-100/40 shadow-sm shrink-0"
                onClick={() => handleDelete(mat.id)}
                disabled={loadingAction}
                title="Delete"
              >
                <Trash2 className="w-[18px] h-[18px] text-[#EF4444]" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseMaterialsGrid;
