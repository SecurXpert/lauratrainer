import { BookOpen } from "lucide-react";

export const TopPerformingCourses = ({ topCoursesData }: { topCoursesData: any[] }) => {
  return (
    <div className="bg-white rounded-[16px] h-[400px] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-slate-900">Top Performing Courses</h2>
        <p className="text-[13px] text-slate-500 mt-0.5">Ranked by completion rate and engagement</p>
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-between mt-1">
        {topCoursesData.length > 0 ? topCoursesData.map((course) => (
          <div key={course.id} className="flex gap-3">
            {course.image ? (
              <div className={`w-[35px] h-[35px] rounded-lg shrink-0 overflow-hidden relative border border-slate-100`}>
                <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-[35px] h-[35px] rounded-lg ${course.bgColor} shrink-0 overflow-hidden relative`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <BookOpen className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-[14px] truncate mb-0.5">{course.name}</h3>
              <div className="flex items-center gap-3 text-[12px] text-slate-500 mb-1.5">
              </div>
              <div className="flex items-center gap-3 w-full">
                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#A855F7] to-[#6366F1] rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BookOpen className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-[14px] font-medium text-gray-500">No courses found for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};
