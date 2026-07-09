import { Search } from "lucide-react";
import { useState } from "react";

export const StudentPerformanceTable = ({ studentPerformanceData }: { studentPerformanceData: any[] }) => {
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const filteredStudents = studentPerformanceData.filter(student => {
    return student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(studentSearchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900">Student Performance</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-[220px]"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto w-full custom-scrollbar pb-2">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student</th>
              <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quiz Name</th>
              <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Attempts</th>
              <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Score</th>
              <th className="pb-3 pt-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${student.avatarColor} text-white flex items-center justify-center text-[12px] font-bold shrink-0`}>
                        {student.initials}
                      </div>
                      <span className="font-semibold text-[14px] text-gray-900 whitespace-nowrap">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[14px] text-gray-600 font-medium">
                    {student.course}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-gray-600 font-medium">
                    {student.assignments}
                  </td>
                  <td className={`py-4 px-4 text-[14px] font-bold ${student.scoreColor}`}>
                    {student.score}%
                  </td>
                  <td className="py-4 px-4 text-[14px] font-bold text-indigo-600">
                    {student.accuracy}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Search className="w-8 h-8 mb-3 text-gray-300" />
                    <p className="text-[14px] font-medium text-gray-500">No students found matching your filters.</p>
                    <button
                      onClick={() => setStudentSearchTerm("")}
                      className="mt-3 text-[13px] text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
