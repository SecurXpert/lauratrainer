import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Exam } from './ExamManagementTypes';

interface ExamManagementExamDetailsProps {
  selectedExam: Exam;
  setSelectedExam: (exam: Exam | null) => void;
}

const ExamManagementExamDetails: React.FC<ExamManagementExamDetailsProps> = ({
  selectedExam, setSelectedExam
}) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{selectedExam.title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{selectedExam.description}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedExam(null)}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Course ID</p>
            <p className="font-medium">{selectedExam.course_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedExam.duration} min
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium">{selectedExam.category}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Window Start</p>
            <p className="font-medium">{new Date(selectedExam.window_start).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Window End</p>
            <p className="font-medium">{new Date(selectedExam.window_end).toLocaleString()}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Questions</p>
          <div className="border rounded-lg p-4 space-y-2">
            {Object.entries(selectedExam.questions || {}).map(([key, q]: [string, any]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  Q{key}: Bank ID {q.question_bank_id}
                </span>
                <span className="text-sm font-medium text-blue-600">{q.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamManagementExamDetails;
