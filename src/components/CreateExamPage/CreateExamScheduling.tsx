import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface CreateExamSchedulingProps {
  window_start: string;
  window_end: string;
  duration: string;
  todayStr: string;
  maxDateStr: string;
  getMinTimeForStartDate: () => string | undefined;
  getMinTimeForEndDate: () => string | undefined;
  getLocalDateString: (d?: Date) => string;
  handleExamFormChange: (field: string, value: any) => void;
}

const CreateExamScheduling: React.FC<CreateExamSchedulingProps> = ({
  window_start,
  window_end,
  duration,
  todayStr,
  maxDateStr,
  getMinTimeForStartDate,
  getMinTimeForEndDate,
  getLocalDateString,
  handleExamFormChange
}) => {
  return (
    <Card className="border-0 shadow-none rounded-[20px] bg-[#f8fafc]">
      <CardContent className="p-4 sm:p-8">
        <h3 className="text-[18px] font-bold text-[#1e293b] mb-6">Scheduling</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1e293b]">Window Start Date <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="date"
                  value={window_start ? window_start.split('T')[0] : ''}
                  min={todayStr}
                  max={maxDateStr}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  onChange={(e) => {
                    const time = window_start && window_start.includes('T')
                      ? window_start.split('T')[1]
                      : (() => {
                          const now = new Date();
                          return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        })();
                    handleExamFormChange('window_start', `${e.target.value}T${time}`);
                  }}
                  required
                  className="pl-12 h-12 w-full rounded-[14px] bg-white border border-slate-200 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1e293b]">Start Time <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={window_start && window_start.includes('T') ? window_start.split('T')[1] : ''}
                min={getMinTimeForStartDate()}
                onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                onChange={(e) => {
                  const date = window_start ? window_start.split('T')[0] : getLocalDateString();
                  handleExamFormChange('window_start', `${date}T${e.target.value}`);
                }}
                required
                className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1e293b]">Window End Date <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="date"
                  value={window_end ? window_end.split('T')[0] : ''}
                  min={todayStr}
                  max={maxDateStr}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                  onChange={(e) => {
                    const time = window_end && window_end.includes('T')
                      ? window_end.split('T')[1]
                      : (() => {
                          if (window_start && window_start.includes('T')) {
                            return window_start.split('T')[1];
                          }
                          const now = new Date();
                          return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        })();
                    handleExamFormChange('window_end', `${e.target.value}T${time}`);
                  }}
                  required
                  className="pl-12 h-12 w-full rounded-[14px] bg-white border border-slate-200 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1e293b]">End Time <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={window_end && window_end.includes('T') ? window_end.split('T')[1] : ''}
                min={getMinTimeForEndDate()}
                onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                onChange={(e) => {
                  const date = window_end ? window_end.split('T')[0] : getLocalDateString();
                  handleExamFormChange('window_end', `${date}T${e.target.value}`);
                }}
                required
                className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-2 w-full">
            <Label className="text-[14px] font-semibold text-[#1e293b]">Duration (minutes) <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              value={duration}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                handleExamFormChange('duration', val);
              }}
              placeholder="e.g., 120"
              required
              className="h-12 w-full rounded-[14px] bg-white border border-slate-200 px-4 text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateExamScheduling;
