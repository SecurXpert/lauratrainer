import React from 'react';
import { Calendar, Trash2, Timer, Link } from 'lucide-react';
import { format } from 'date-fns';
import { LiveClass } from './ClassesTypes';
import { parseScheduledDate, getClassStatus } from './ClassesUtils';

interface ClassesGridProps {
  loading: boolean;
  filteredClassesCount: number;
  paginatedClasses: LiveClass[];
  availableCourses: any[];
  deletingId: number | null;
  handleDelete: (cls: LiveClass) => void;
  handleCopyLink: (link: string) => void;
}

export const ClassesGrid: React.FC<ClassesGridProps> = ({
  loading, filteredClassesCount, paginatedClasses, availableCourses, deletingId, handleDelete, handleCopyLink
}) => {
  if (loading) {
    return <div className="text-center py-12 text-gray-500 animate-pulse">Loading...</div>;
  }

  if (filteredClassesCount === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No classes found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedClasses.map((cls) => {
        const course = availableCourses.find(c => String(c.id) === String(cls.course_id));
        const courseName = course ? (course.title || course.name) : `Course #${cls.course_id}`;
        const classStatus = getClassStatus(cls.scheduled_at);
        const statusBg = classStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

        return (
          <div key={cls.id} className="min-w-0 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">{cls.title}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusBg}`}>
                  {classStatus}
                </span>
              </div>

              {/* Course Title Badge */}
              <div className="mb-4">
                <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                  {courseName}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-3">
                Join the live session to learn and interact with the instructor in real-time.
              </p>

              <div className="space-y-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="block text-gray-500 text-[13px] font-medium">Date</span>
                      <span className="block text-gray-900 font-bold mt-0.5">
                        {(() => {
                          try {
                            const d = parseScheduledDate(cls.scheduled_at);
                            return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'dd MMM yyyy');
                          } catch {
                            return 'Invalid Date';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm justify-end text-right">
                    <div>
                      <span className="block text-gray-500 text-[13px] font-medium">Time</span>
                      <span className="block text-gray-900 font-bold mt-0.5">
                        {(() => {
                          try {
                            const d = parseScheduledDate(cls.scheduled_at);
                            return isNaN(d.getTime()) ? 'Invalid Time' : format(d, 'hh:mm a');
                          } catch {
                            return 'Invalid Time';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Timer className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="block text-gray-500 text-[13px] font-medium">Duration</span>
                      <span className="block text-gray-900 font-bold mt-0.5">{cls.duration} min</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm justify-end text-right">
                    <Link className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <button
                        onClick={() => handleCopyLink(cls.join_link)}
                        className="block text-gray-500 text-[13px] font-medium hover:text-gray-700 transition ml-auto"
                      >
                        Copy Link
                      </button>
                      <span
                        className="block text-blue-600 text-[13px] font-bold cursor-pointer hover:text-blue-700 transition mt-1 ml-auto"
                        onClick={() => window.open(cls.join_link, '_blank')}
                      >
                        Join Link
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(cls)}
              disabled={loading || deletingId !== null}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 mt-2"
            >
              <Trash2 className="w-4 h-4" />
              {deletingId === cls.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        );
      })}
    </div>
  );
};
