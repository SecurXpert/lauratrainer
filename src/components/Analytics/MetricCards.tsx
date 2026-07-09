import { Users, BookOpen } from "lucide-react";

export const MetricCards = ({ activeStudentsCount, liveClassesCount }: { activeStudentsCount: number | null, liveClassesCount: number | null }) => {
  return (
    <div className="flex flex-wrap gap-6 mb-8">
      {/* Card 1 */}
      <div className="bg-white h-[180px] w-[250px] rounded-[20px] px-5 py-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden shrink-0">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#e9d5ff] rounded-full blur-[40px] opacity-100"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#7C86FF] to-[#4F39F6] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-[30px] font-bold text-slate-900 leading-none">
              {activeStudentsCount !== null ? activeStudentsCount.toLocaleString() : "0"}
            </h3>
          </div>
          <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
            <p className="text-[13px] font-semibold text-slate-700">Active Students</p>
            <div className="w-20 h-7 shrink-0">
            </div>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white h-[180px] w-[250px] rounded-[20px] px-5 py-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden shrink-0">
        <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#51A2FF] to-[#155DFC] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-[30px] font-bold text-slate-900 leading-none">
              {liveClassesCount !== null ? liveClassesCount.toLocaleString() : "0"}
            </h3>
          </div>
          <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
            <p className="text-[13px] font-semibold text-slate-700">Live Classes</p>
            <div className="w-20 h-7 shrink-0">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
