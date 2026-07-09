import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileQuestion, BarChart2, Clock, Eye, Pencil, Trash2, Calendar, Loader2 } from "lucide-react";
import { Quiz, getQuizStatus, formatDate } from './QuizzesTypes';

interface QuizzesGridProps {
  loading: boolean;
  error: string | null;
  filteredQuizzes: Quiz[];
  currentPage: number;
  itemsPerPage: number;
  handleDelete: (id: number) => void;
}

const QuizzesGrid: React.FC<QuizzesGridProps> = ({
  loading, error, filteredQuizzes, currentPage, itemsPerPage, handleDelete
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (filteredQuizzes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <FileQuestion className="mx-auto text-gray-400" size={48} />
        <h3 className="mt-4 text-lg font-medium">No quizzes found</h3>
        <p className="mt-1 text-gray-500">
          Try adjusting your filters or create a new quiz.
        </p>
      </div>
    );
  }

  const currentQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {currentQuizzes.map((quiz) => {
        const quizStatus = getQuizStatus(quiz);
        return (
          <Card
            key={quiz.id}
            className="border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white relative"
            style={{
              background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.10) 0%, rgba(255, 255, 255, 1) 65%)"
            }}
          >
            <CardContent className="p-6">
              {/* Title + Active Badge */}
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 pr-2 min-h-[56px]">
                  {quiz.title}
                </h3>
                <Badge
                  className={`px-3 py-1 text-xs font-bold whitespace-nowrap ${quizStatus === "active"
                    ? "bg-[#F0FDF4] text-[#166534] hover:bg-[#F0FDF4]"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-50"
                    }`}
                  style={quizStatus === "active" ? { border: "1.35px solid #B9F8CF" } : undefined}
                >
                  {quizStatus.charAt(0).toUpperCase() +
                    quizStatus.slice(1)}
                </Badge>
              </div>

              <hr className="border-gray-100 mb-3" />

              {/* Stats Grid - 2x2 layout matching reference */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-5 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                    <FileQuestion className="w-4 h-4 text-gray-400" /> Questions
                  </span>
                  <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                    {quiz.questions_count || 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                    <BarChart2 className="w-4 h-4 text-gray-400" /> Course Id
                  </span>
                  <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                    {quiz.course_id}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-gray-400" /> Duration
                  </span>
                  <span className="font-bold text-xl text-[#0F172A] mt-1.5">
                    {quiz.time || "45m"}
                  </span>
                </div>
              </div>

              <hr className="border-gray-100 mb-5" />

              {/* Action Buttons */}
              <div className="flex flex-row gap-1 sm:gap-2 w-full mt-auto">
                <Button
                  className="flex-1 h-7 px-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[11.5px] sm:text-[12.5px] shadow-sm rounded-[8px] min-w-0"
                  onClick={() => navigate(`/quizzes/${quiz.id}/view`)}
                >
                  <Eye className="w-[12px] h-[12px] mr-1 shrink-0" />
                  <span className="truncate">View</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 h-7 px-0 border-[1.5px] border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold text-[11.5px] sm:text-[12.5px] shadow-sm rounded-[8px] min-w-0"
                  onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                >
                  <Pencil className="w-[12px] h-[12px] mr-1 shrink-0" />
                  <span className="truncate">Edit</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 h-7 px-0 border-[1.5px] border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold text-[11.5px] sm:text-[12.5px] shadow-sm rounded-[8px] min-w-0"
                  onClick={() => handleDelete(quiz.id)}
                >
                  <Trash2 className="w-[12px] h-[12px] mr-1 shrink-0" />
                  <span className="truncate">Delete</span>
                </Button>
              </div>

              {/* Updated Date */}
              {quiz.updated_at && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Updated {formatDate(quiz.updated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuizzesGrid;
