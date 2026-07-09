import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

interface ExamFormSchedulingProps {
  windowStartDate: string;
  setWindowStartDate: (val: string) => void;
  windowStartTime: string;
  setWindowStartTime: (val: string) => void;
  windowEndDate: string;
  setWindowEndDate: (val: string) => void;
  windowEndTime: string;
  setWindowEndTime: (val: string) => void;
  duration: number | '';
  setDuration: (val: number | '') => void;
  today: string;
}

const ExamFormScheduling: React.FC<ExamFormSchedulingProps> = ({
  windowStartDate, setWindowStartDate,
  windowStartTime, setWindowStartTime,
  windowEndDate, setWindowEndDate,
  windowEndTime, setWindowEndTime,
  duration, setDuration,
  today
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Scheduling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Window Start Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={windowStartDate}
                onChange={(e) => setWindowStartDate(e.target.value)}
                required
                min={today}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="time"
                value={windowStartTime}
                onChange={(e) => setWindowStartTime(e.target.value)}
                required
              />
              <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Window End Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={windowEndDate}
                onChange={(e) => setWindowEndDate(e.target.value)}
                required
                min={today}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="time"
                value={windowEndTime}
                onChange={(e) => setWindowEndTime(e.target.value)}
                required
              />
              <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
            Duration (minutes) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g., 120"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamFormScheduling;
