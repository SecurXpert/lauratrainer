import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurriculumTableProps {
  curriculumList: any[];
  currentItems: any[];
  selectedStudentId: string;
  completedModules: Record<number, string>;
  navigate: (path: string) => void;
  handleDelete: (courseId: number, moduleId: number) => void;
  updateModuleStatus: (courseId: number, moduleId: number, status: string) => void;
}

const CurriculumTable: React.FC<CurriculumTableProps> = ({
  curriculumList,
  currentItems,
  selectedStudentId,
  completedModules,
  navigate,
  handleDelete,
  updateModuleStatus
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-5 sm:py-7">
        <CardTitle className="text-[20px] sm:text-[24px] font-bold text-gray-900">
          Curriculum List
        </CardTitle>
        <div className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[13px] sm:text-sm font-semibold w-fit">
          Total: {curriculumList.length} Modules
        </div>
      </div>

      {curriculumList.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          Select a course and click "Fetch Data" to load curriculum
        </div>
      ) : (
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100 text-gray-500">
                <th className="px-4 sm:px-7 py-4 sm:py-5 text-left font-semibold whitespace-nowrap">MODULE ID</th>
                <th className="px-4 sm:px-7 py-4 sm:py-5 text-left font-semibold whitespace-nowrap">COURSE ID</th>
                <th className="px-4 sm:px-7 py-4 sm:py-5 text-left font-semibold whitespace-nowrap">MODULE TITLE</th>
                <th className="px-4 sm:px-7 py-4 sm:py-5 text-center font-semibold whitespace-nowrap">STATUS</th>
                <th className="px-4 sm:px-7 py-4 sm:py-5 text-center font-semibold whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <td className="px-4 sm:px-7 py-4 sm:py-6 text-gray-500 font-medium">
                    {item.id}
                  </td>

                  <td className="px-4 sm:px-7 py-4 sm:py-6 text-gray-500 font-medium">
                    {item.course_id}
                  </td>

                  <td className="px-4 sm:px-7 py-4 sm:py-6">
                    <div className="text-[18px] font-bold text-gray-900 leading-tight">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="mt-1.5">
                        <div className="text-[14px] text-gray-500 leading-snug max-h-[38px] overflow-hidden">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 sm:px-7 py-4 sm:py-6 text-center text-gray-500 font-medium">
                    {item.is_active ? "Active" : "Inactive"}
                  </td>

                  <td className="px-4 sm:px-7 py-4 sm:py-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex justify-center items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                          onClick={() => navigate(`/curriculum/${item.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 transition-all rounded-lg"
                          onClick={() => handleDelete(item.course_id, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {selectedStudentId ? (
                        <Select
                          value={completedModules[item.id] || "pending"}
                          onValueChange={(val) => updateModuleStatus(item.course_id, item.id, val)}
                        >
                          <SelectTrigger className={`h-8 w-[130px] rounded-full text-[11.5px] font-bold border transition-all duration-200 cursor-pointer ${completedModules[item.id] === "completed"
                              ? "bg-[#d1fae5] border-[#6ee7b7] text-[#065f46] hover:bg-[#a7f3d0]"
                              : completedModules[item.id] === "in_progress"
                                ? "bg-[#dbeafe] border-[#93c5fd] text-[#1e40af] hover:bg-[#bfdbfe]"
                                : "bg-[#f3f4f6] border-[#d1d5db] text-[#374151] hover:bg-[#e5e7eb]"
                            }`}>
                            <SelectValue placeholder="Set Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="pending" className="text-gray-700 text-xs font-semibold">Pending</SelectItem>
                            <SelectItem value="in_progress" className="text-blue-700 text-xs font-semibold">In Progress</SelectItem>
                            <SelectItem value="completed" className="text-emerald-700 text-xs font-semibold">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium italic">
                          Select student to set status
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default CurriculumTable;
