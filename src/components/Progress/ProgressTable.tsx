import React from "react";

interface ProgressTableProps {
  paginatedRows: any[];
}

const ProgressTable: React.FC<ProgressTableProps> = ({ paginatedRows }) => {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-[#F1F5F9] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[#64748B] text-[12px] font-bold tracking-wider">
            <th className="px-6 py-4.5 text-left font-semibold uppercase">STUDENT</th>
            <th className="px-6 py-4.5 text-left font-semibold uppercase">COURSE</th>
            <th className="px-6 py-4.5 text-left font-semibold uppercase">INSTRUCTOR</th>
            <th className="px-6 py-4.5 text-left font-semibold uppercase">MODULES</th>
            <th className="px-6 py-4.5 text-left font-semibold uppercase">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {paginatedRows.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-[#64748B] font-medium">
                No records found matching filters.
              </td>
            </tr>
          ) : (
            paginatedRows.map((row) => {
              // Determine status badge colors
              let badgeClass = "bg-gray-50 text-gray-500 border-gray-100";
              let dotClass = "bg-gray-400";
              if (row.status === "Completed") {
                badgeClass = "bg-[#ECFDF5] text-[#047857] border-[#D1FAE5]";
                dotClass = "bg-[#10B981]";
              } else if (row.status === "In Progress") {
                badgeClass = "bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]";
                dotClass = "bg-[#3B82F6]";
              } else if (row.status === "At Risk") {
                badgeClass = "bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]";
                dotClass = "bg-[#F59E0B]";
              } else if (row.status === "Not Started") {
                badgeClass = "bg-slate-50 text-slate-500 border-slate-100";
                dotClass = "bg-slate-400";
              }

              return (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="px-6 py-5 font-bold text-slate-800 text-[14px]">
                    {row.studentName}
                  </td>
                  <td className="px-6 py-5 text-slate-600 font-medium text-[14px]">
                    {row.course}
                  </td>
                  <td className="px-6 py-5 text-slate-600 font-medium text-[14px]">
                    {row.instructor}
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-semibold text-[14px]">
                    <span className="text-slate-800">{row.modules.split(" / ")[0]}</span>
                    <span className="text-slate-300"> / {row.modules.split(" / ")[1]}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressTable;
