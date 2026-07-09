import React from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';
import { LiveClass } from './ClassesTypes';

interface ScheduleClassModalProps {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  courseId: number | '';
  setCourseId: (c: number | '') => void;
  title: string;
  setTitle: (t: string) => void;
  scheduledAt: string;
  setScheduledAt: (s: string) => void;
  duration: number | '';
  setDuration: (d: number | '') => void;
  joinLink: string;
  setJoinLink: (l: string) => void;
  availableCourses: any[];
  classes: LiveClass[];
  handleSchedule: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  error: string | null;
  loading: boolean;
  minDateTime: string;
  maxDateTime: string;
}

export const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({
  showModal, setShowModal, courseId, setCourseId, title, setTitle,
  scheduledAt, setScheduledAt, duration, setDuration, joinLink, setJoinLink,
  availableCourses, classes, handleSchedule, resetForm, error, loading,
  minDateTime, maxDateTime
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/50">
      <div className="flex min-h-full items-end justify-center p-4 pb-10 sm:items-center sm:p-4 sm:py-8">
        <div
          className="flex min-h-0 w-full max-w-[380px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[calc(100dvh-4rem)] sm:max-h-[min(90dvh,44rem)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-class-title"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
            <h2 id="schedule-class-title" className="min-w-0 text-base font-semibold text-blue-600 sm:text-lg">
              Schedule New class
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 no-scrollbar">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <div className="relative">
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(Number(e.target.value) || '')}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm appearance-none cursor-pointer bg-white"
                  >
                    <option value="" disabled>Select Course</option>
                    {availableCourses.length > 0 ? availableCourses.map(course => {
                      const courseTitle = course.title || course.name || `Course #${course.id}`;
                      const displayTitle = courseTitle.length > 25 ? courseTitle.substring(0, 25) + "..." : courseTitle;
                      return (
                        <option key={course.id} value={course.id}>
                          {displayTitle} (ID: {course.id})
                        </option>
                      );
                    }) : classes.reduce((unique: number[], cls) => {
                      if (!unique.includes(cls.course_id)) unique.push(cls.course_id);
                      return unique;
                    }, []).map(id => (
                      <option key={id} value={id}>Course ID: {id}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter Title"
                  maxLength={40}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Date&amp;Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                    placeholder="dd/mm/yyyy, --:--"
                    required
                    min={minDateTime}
                    max={maxDateTime}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm text-gray-900 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={duration}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setDuration(val ? Number(val) : '');
                  }}
                  placeholder="Enter duration in minutes"
                  maxLength={3}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Link
                </label>
                <input
                  type="url"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  placeholder="https://meet.google.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition mt-2"
              >
                {loading ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
