import React from 'react';
import { X, Loader2, Flame, Trophy, Award, Calendar, Phone, MapPin } from "lucide-react";
import { Student } from './MystudentsTypes';

interface MystudentsProfileModalProps {
  selectedStudent: Student | null;
  setShowProfileModal: (val: boolean) => void;
  loadingStreak: boolean;
  streakData: any;
}

const MystudentsProfileModal: React.FC<MystudentsProfileModalProps> = ({
  selectedStudent, setShowProfileModal, loadingStreak, streakData
}) => {
  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#F8F9FA] rounded-3xl shadow-2xl w-full max-w-[420px] overflow-y-auto no-scrollbar max-h-[95vh] animate-in zoom-in-95 duration-300 relative">
        <button
          onClick={() => setShowProfileModal(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-7">
          {/* Header */}
          <div className="flex gap-4 items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#5B45FF] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#5B45FF]/30 shrink-0">
              {selectedStudent.initials}
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 leading-tight">
                {selectedStudent.name}
              </h2>
              <p className="text-slate-500 text-[13px] mb-2">{selectedStudent.email}</p>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F8F0] text-[#16A34A] border border-[#DCFCE7]">
                  {selectedStudent.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]">
                  {selectedStudent.category}
                </span>
              </div>
            </div>
          </div>

          {/* Streak & Points Cards (2x2 Grid) */}
          {loadingStreak ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-center shadow-sm h-[76px]">
                  <Loader2 className="w-5 h-5 text-[#5B45FF] animate-spin" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Streak</span>
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {streakData?.current_streak ?? 0} {(streakData?.current_streak ?? 0) === 1 ? '' : ''}
                </h3>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Longest Streak</span>
                  <div className="w-7 h-7 rounded-lg bg-yellow-50 text-yellow-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 ">
                  {streakData?.longest_streak ?? 0} {(streakData?.longest_streak ?? 0) === 1 ? '' : ''}
                </h3>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Points</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {streakData?.total_points ?? 0} pts
                </h3>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Last Attendance</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 truncate">
                  {streakData?.last_attendance_date
                    ? new Date(streakData.last_attendance_date).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                    : 'None'}
                </h3>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-[#EEF1FA] border border-[#E2E8F4] rounded-2xl p-4 mb-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Contact Information</h3>
            <div className="space-y-2.5 text-[13px] text-slate-500 font-medium">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{selectedStudent.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{selectedStudent.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MystudentsProfileModal;
