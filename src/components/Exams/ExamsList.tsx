import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Exam } from './ExamsTypes';
import { useNavigate } from 'react-router-dom';

interface ExamsListProps {
  fetching: boolean;
  filteredExams: Exam[];
  examsLength: number;
  handleDelete: (examId: number, title: string) => void;
  formatDate: (dateStr: string) => string;
}

const ExamsList: React.FC<ExamsListProps> = ({
  fetching, filteredExams, examsLength, handleDelete, formatDate
}) => {
  const navigate = useNavigate();

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading exams...</div>
      </div>
    );
  }

  if (filteredExams.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No exams found</p>
          <p className="text-sm text-gray-400">
            {examsLength === 0
              ? 'Create your first exam to get started'
              : 'Try adjusting your search or filters'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {filteredExams.map((exam) => (
        <Card key={exam.id} className="bg-white overflow-hidden rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <CardContent className="p-0">
            <div className="p-5 border-b">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{exam.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${exam.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400">ID: {exam.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <FileText className="h-3 w-3 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  {exam.collage} - {exam.category}
                </span>
              </div>
            </div>

            <div className="px-5 py-3">
              <p className="text-sm text-gray-500 line-clamp-2">
                {exam.description || 'No description available for this exam.'}
              </p>
            </div>

            <div className="px-5 py-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Start Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(exam.window_start)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">End Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(exam.window_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="text-sm font-medium text-gray-700">{exam.duration} min</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Questions</p>
                    <p className="text-sm font-medium text-gray-700">
                      {Object.keys(exam.questions).length} Questions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-4 flex gap-3">
              <Button
                onClick={() => navigate(`/exams/${exam.id}/edit`)}
                className="flex-1 h-11 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(exam.id, exam.title)}
                className="flex-1 h-11 gap-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-[0_4px_14px_0_rgb(0,0,0,0.05)] transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExamsList;
