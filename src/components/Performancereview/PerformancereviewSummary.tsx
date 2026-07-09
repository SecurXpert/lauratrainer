import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Star, Calendar } from "lucide-react";
import { Student, Course, Review, getInitials, formatDate } from './PerformancereviewTypes';

interface PerformancereviewSummaryProps {
  reviews: Review[];
  students: Student[];
  courses: Course[];
  selectedStudentId: number;
  selectedCourseId: number;
}

const PerformancereviewSummary: React.FC<PerformancereviewSummaryProps> = ({
  reviews, students, courses, selectedStudentId, selectedCourseId
}) => {
  return (
    <Card className="w-full shadow-sm border-gray-100 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <h3 className="text-xl font-bold text-gray-800">Performance Summary</h3>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[13px] font-semibold">Improving</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-lg font-medium shadow-sm flex-shrink-0">
              {getInitials(students.find(s => s.id === selectedStudentId)?.name || "Student")}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{students.find(s => s.id === selectedStudentId)?.name || "Student"}</p>
              <p className="text-[13px] text-gray-500">{reviews.length} Reviews</p>
            </div>
          </div>

          <div className="md:border-l border-gray-100 md:pl-6 md:ml-2">
            <p className="text-[13px] text-gray-400 font-medium mb-2">Current Course</p>
            <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[13px] font-semibold w-fit">
              {courses.find(c => c.id === selectedCourseId)?.title || "Course"}
            </span>
          </div>

          <div className="md:border-l border-gray-100 md:pl-6 md:ml-2">
            <p className="text-[13px] text-gray-400 font-medium mb-2">Average Rating</p>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current opacity-50" />
              </div>
              <span className="font-bold text-gray-900">4.5</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-[13px] text-gray-500 font-medium">
          <Calendar className="w-4 h-4 mr-2" />
          Last reviewed on {formatDate(reviews[reviews.length - 1]?.created_at || reviews[0]?.created_at)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformancereviewSummary;
