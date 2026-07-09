import { Target, TrendingUp } from "lucide-react";

export const QuizAnalyticsCard = ({ totalQuizzesCount, averageScore, topicPerformance }: { totalQuizzesCount: number | null, averageScore: string, topicPerformance: any[] }) => {
  const stats = [
    { title: "Total Quizzes", value: totalQuizzesCount !== null ? totalQuizzesCount.toString() : "0", icon: Target, bg: "bg-indigo-500" },
    { title: "Average Score", value: averageScore, icon: TrendingUp, bg: "bg-purple-500" }
  ];

  return (
    <div className="bg-white rounded-[16px] h-[400px] p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col">
      <div className="mb-3">
        <h2 className="text-[17px] font-bold text-slate-900">Quiz Analytics</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Performance breakdown across all published quizzes</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3.5 shrink-0">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-slate-50/70 rounded-xl p-2.5 flex items-center gap-3 border border-slate-100">
              <div className={`${item.bg} w-8 h-8 rounded-[8px] flex items-center justify-center text-white shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-medium mb-0.5">{item.title}</p>
                <h3 className="text-[17px] font-bold text-slate-900 leading-tight">{item.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col min-h-0 flex-1">
        <h3 className="text-[14px] font-bold text-slate-800 mb-2 shrink-0">Topic-wise Performance</h3>
        <div className="flex-1 overflow-hidden space-y-2.5">
          {topicPerformance.length > 0 ? topicPerformance.map((item) => (
            <div key={item.topic}>
              <div className="flex justify-between items-center mb-1 gap-2">
                <span className="text-[12px] text-slate-600 font-medium truncate" title={item.topic}>{item.topic}</span>
                <span className="font-semibold text-[12px] text-slate-700 shrink-0">{item.score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.score}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-4">
              <Target className="w-10 h-10 mb-3 text-gray-200" />
              <p className="text-[13px] font-medium text-gray-500">No quiz data found for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
