import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CreateExamBasicInfoProps {
  title: string;
  course_id: string;
  category: string;
  courses: any[];
  handleExamFormChange: (field: string, value: any) => void;
}

const CreateExamBasicInfo: React.FC<CreateExamBasicInfoProps> = ({
  title,
  course_id,
  category,
  courses,
  handleExamFormChange
}) => {
  return (
    <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
      <CardContent className="p-4 sm:p-8">
        <h3 className="text-[18px] font-bold text-[#1e293b] mb-6">Basic Information</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[14px] font-semibold text-[#1e293b]">Exam Title <span className="text-red-500">*</span></Label>
            <Input
              value={title}
              onChange={(e) => handleExamFormChange('title', e.target.value)}
              maxLength={30}
              placeholder="e.g., Final Examination - Computer Science"
              required
              className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1e293b]">Select Course <span className="text-red-500">*</span></Label>
              <select
                value={course_id}
                onChange={(e) => handleExamFormChange('course_id', e.target.value)}
                required
                className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
              >
                <option value="" disabled>Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id.toString()}>{c.title} (ID: {c.id})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1e293b]">Category <span className="text-red-500">*</span></Label>
              <Input
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-Z\s]*$/.test(val)) {
                    handleExamFormChange('category', val);
                  }
                }}
                placeholder="e.g., technical"
                maxLength={25}
                required
                className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateExamBasicInfo;
