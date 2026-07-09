import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Clock, Globe, Users } from "lucide-react";
import { FaChartColumn } from "react-icons/fa6";
import { API_BASE_URL } from "../../pages/services/api/api";

interface CoursesGridProps {
  currentCourses: any[];
  instructorName: string;
  getCategoryName: (id: any) => string;
  capitalizeWords: (str: string) => string;
  onEditCourse: (id: number) => void;
  onDeleteCourse: (id: number) => void;
}

const CoursesGrid: React.FC<CoursesGridProps> = ({
  currentCourses,
  instructorName,
  getCategoryName,
  capitalizeWords,
  onEditCourse,
  onDeleteCourse
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
      {currentCourses.map((course: any) => (
        <Card
          key={course.id}
          className="relative overflow-hidden border-[1.35px] border-[#E5E7EB] rounded-[22px] shadow-sm hover:shadow-md transition-all duration-200 bg-white bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.07),_transparent_45%)] flex flex-col h-full"
        >
          {/* Course Image Banner */}
          <div className="h-36 sm:h-40 md:h-44 w-full bg-slate-50 overflow-hidden relative shrink-0 border-b border-slate-100">
            <img
              src={
                course.image
                  ? course.image.startsWith("http")
                    ? course.image
                    : `${API_BASE_URL}${course.image.startsWith("/") ? "" : "/"}${course.image}`
                  : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
              }
              alt={course.title || "Course Image"}
              className="w-full h-full object-cover"
            />
            
            {/* Status Badge Overlay */}
            <div className="absolute top-2.5 right-2.5">
              <span
                className={`h-[24px] px-2.5 flex items-center justify-center text-[11.5px] font-bold rounded-full shadow-sm border backdrop-blur-md ${course.status?.toLowerCase() === "active"
                  ? "bg-[#F0FDF4]/90 text-[#16A34A] border-[#DCFCE7]/60"
                  : "bg-[#FEF2F2]/90 text-[#EF4444] border-[#FEE2E2]/60"
                  }`}
              >
                {capitalizeWords(course.status || "Active")}
              </span>
            </div>
          </div>
          <CardContent className="p-3.5 sm:p-4 md:p-5 lg:p-6 flex flex-col h-full">
            <div className="flex justify-between items-start gap-2 sm:gap-3 mb-2">
              <h3
                className="text-[15px] sm:text-[16px] lg:text-[18px] font-bold text-[#0F172A] leading-snug line-clamp-2"
                title={course.title || "Untitled Course"}
              >
                {course.title || "Untitled Course"}
              </h3>
            </div>

            <p className="text-slate-600 text-[12.5px] sm:text-[13px] lg:text-[13.5px] line-clamp-2 mb-3 leading-relaxed h-10">
              {course.description || "No description available."}
            </p>

            <div className="py-1 my-1">
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 lg:gap-x-5 gap-y-3 sm:gap-y-4 text-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                    <p className="text-[12.5px] font-semibold leading-none">Schedule</p>
                  </div>
                  <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight truncate" title={course.schedule || "Jan 25-Jun 25"}>
                    {course.schedule || "Jan 25-Jun 25"}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                    <p className="text-[12.5px] font-semibold leading-none">Instructor</p>
                  </div>
                  <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight truncate" title={course.instructor_name || course.instructor?.name || instructorName || String(course.instructor_id || "Laura")}>
                    {course.instructor_name || course.instructor?.name || instructorName || course.instructor_id || "Laura"}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FaChartColumn className="w-[15px] h-[15px] shrink-0 text-slate-600" />
                    <p className="text-[12.5px] font-semibold leading-none">Category</p>
                  </div>
                  <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight truncate">
                    {getCategoryName(course.category_id)}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                    <p className="text-[12.5px] font-semibold leading-none">Level</p>
                  </div>
                  <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight capitalize truncate">
                    {capitalizeWords(course.level || "Intermediate")}
                  </p>
                </div>

                <div className="min-w-0 col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Globe className="w-[15px] h-[15px] stroke-[2.2] shrink-0 text-slate-600" />
                    <p className="text-[12.5px] font-semibold leading-none">Language</p>
                  </div>
                  <p className="font-bold text-[#0F172A] text-[13.5px] mt-1.5 leading-tight capitalize truncate" title={capitalizeWords(course.language || "selenium java")}>
                    {capitalizeWords(course.language || "selenium java")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons restored to bottom */}
            <div className="flex flex-col lg:flex-row gap-2.5 mt-auto pt-3.5">
              <Button
                onClick={() => onEditCourse(course.id)}
                className="w-full lg:flex-[1.3] h-9 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-[10px] text-[13px] sm:text-[14px] font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Edit className="w-[14px] h-[14px] shrink-0" />
                Edit Course
              </Button>
              <Button
                onClick={() => onDeleteCourse(course.id)}
                className="w-full lg:flex-1 h-9 bg-[#FF453A] hover:bg-[#E03E34] text-white rounded-[10px] text-[13px] sm:text-[14px] font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-[14px] h-[14px] shrink-0" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CoursesGrid;
