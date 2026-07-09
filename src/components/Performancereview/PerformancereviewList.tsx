import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Review, getInitials } from './PerformancereviewTypes';

interface PerformancereviewListProps {
  loading: boolean;
  reviews: Review[];
  paginatedReviews: Review[];
  indexOfFirstReview: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  setEditingId: (id: number) => void;
  setEditText: (text: string) => void;
  handleDelete: (id: number) => void;
}

const PerformancereviewList: React.FC<PerformancereviewListProps> = ({
  loading, reviews, paginatedReviews, indexOfFirstReview, totalPages,
  currentPage, setCurrentPage, setEditingId, setEditText, handleDelete
}) => {
  return (
    <Card className="w-full shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">Reviews List</CardTitle>
        <div className="text-sm text-gray-500 font-medium">{reviews.length} total reviews</div>
      </CardHeader>

      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No reviews found
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-4">
              {paginatedReviews.map((review, index) => (
                <div key={review.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl mb-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-md transition-all duration-200">
                  <div className="flex flex-1 w-full flex-col md:flex-row gap-6">
                    <div className="hidden md:flex w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-600 font-bold rounded-xl items-center justify-center">
                      {indexOfFirstReview + index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[13px] text-gray-400 mb-2">Student</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                            {getInitials(review.student_name)}
                          </div>
                          <span className="text-[15px] font-semibold text-gray-800">{review.student_name}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[13px] text-gray-400 mb-2">Instructor</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                            {getInitials(review.instructor_name)}
                          </div>
                          <span className="text-[15px] font-semibold text-gray-800">{review.instructor_name}</span>
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <p className="text-[13px] text-gray-400 mb-2">Review</p>
                        <p
                          className="text-[14px] text-gray-700 leading-relaxed overflow-hidden"
                          style={{ maxHeight: '44px' }}
                        >
                          {review.review_text}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-center gap-3 mt-4 md:mt-0 md:ml-6 md:pl-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 w-full md:w-auto h-full">
                    <button
                      onClick={() => {
                        setEditingId(review.id);
                        setEditText(review.review_text);
                      }}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Review"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-6 border-t border-gray-100 mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 p-0 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page
                        ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white border-transparent shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 border-gray-200"
                        }`}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="text-slate-600 border-gray-200 rounded-xl hover:bg-slate-50 h-9 font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformancereviewList;
