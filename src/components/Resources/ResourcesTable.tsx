import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileArchive, FileText, FileVideo, Link, Download, Trash2 } from "lucide-react";
import { Resource, Course, formatLocalDate } from './ResourcesTypes';

interface ResourcesTableProps {
  resources: Resource[];
  paginatedResources: Resource[];
  courses: Course[];
  handleDownload: (url: string, filename: string, isExternalUrl: boolean) => void;
  handleDelete: (resObj: any) => void;
}

const ResourcesTable: React.FC<ResourcesTableProps> = ({
  resources, paginatedResources, courses, handleDownload, handleDelete
}) => {
  return (
    <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-[22px] overflow-hidden">
      <CardContent className="p-0">
        {resources.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileArchive className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No materials available</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-[800px] w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">File Name</th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">Course</th>
                  <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">Upload Date</th>
                  <th className="py-4 px-6 text-right text-[13px] font-semibold text-[#101828] whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {paginatedResources
                  .map((res) => {
                    const ft = (res.file_type || '').toLowerCase();
                    const isPdf = ft === 'pdf';
                    const isZip = ft === 'zip' || ft === 'doc';
                    const isVideo = ft === 'mp4';

                    const FileIcon = isPdf ? FileText : isZip ? FileArchive : isVideo ? FileVideo : Link;
                    const iconBg = isPdf ? 'bg-red-50' : isZip ? 'bg-blue-50' : isVideo ? 'bg-purple-50' : 'bg-slate-50';
                    const iconColor = isPdf ? 'text-red-600' : isZip ? 'text-blue-600' : isVideo ? 'text-purple-600' : 'text-slate-600';

                    const uploadDate = res.uploaded_at
                      ? formatLocalDate(res.uploaded_at) || '—'
                      : '—';

                    const courseName = courses.find((c) => String(c.id) === String(res.course_id))?.title || 'Web Development';

                    return (
                      <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                        {/* File Name */}
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <FileIcon className={`w-5 h-5 ${iconColor}`} />
                            </div>
                            <span className="font-medium text-black text-[14px] leading-tight break-words">{res.title}</span>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="py-5 px-6 text-[14px] text-slate-500 font-medium break-words">{courseName}</td>

                        {/* Upload Date */}
                        <td className="py-5 px-6 text-[14px] text-slate-500 font-medium whitespace-nowrap">{uploadDate}</td>

                        {/* Actions */}
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-end gap-3">
                            {res.file_url && (
                              <button
                                onClick={() => handleDownload(res.file_url!, res.title, ft === 'url')}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                title="Download"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(res)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-600 transition-all border border-transparent hover:border-red-100"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourcesTable;
