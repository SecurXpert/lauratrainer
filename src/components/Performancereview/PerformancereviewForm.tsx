import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { GrNotes } from "react-icons/gr";
import { Student, Course } from './PerformancereviewTypes';

interface PerformancereviewFormProps {
  students: Student[];
  courses: Course[];
  setSelectedStudentId: (val: number) => void;
  setSelectedCourseId: (val: number) => void;
  reviewText: string;
  setReviewText: (val: string) => void;
  handleSubmit: () => void;
  fetchReviews: () => void;
}

const PerformancereviewForm: React.FC<PerformancereviewFormProps> = ({
  students, courses, setSelectedStudentId, setSelectedCourseId,
  reviewText, setReviewText, handleSubmit, fetchReviews
}) => {
  return (
    <Card className="w-full shadow-sm border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-[26px] font-bold">Performance Review</CardTitle>
        <p className="text-[14.5px] text-[#64748B]">Evaluate student performance and provide feedback</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Select Student</Label>
            <Select onValueChange={(value) => setSelectedStudentId(Number(value))}>
              <SelectTrigger className="w-full h-[40px] text-[13px] rounded-xl border-slate-200 shadow-sm">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Select Course</Label>
            <Select onValueChange={(value) => setSelectedCourseId(Number(value))}>
              <SelectTrigger className="w-full h-[40px] text-[13px] rounded-xl border-slate-200 shadow-sm">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Review & Feedback</Label>
          <Textarea
            placeholder="Write detailed feedback, strengths, and improvement areas..."
            className="w-full"
            maxLength={250}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="h-10 px-5 rounded-xl w-full sm:w-auto bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submit Review
          </Button>
          <Button
            className="w-full sm:w-auto ml-auto border-2"
            variant="outline"
            onClick={fetchReviews}
          >
            <GrNotes className="w-4 h-4 mr-2" />
            Get Reviews
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformancereviewForm;
