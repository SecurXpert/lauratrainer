import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, Eye, Pencil, Trash2, ChevronDown, ChevronUp, Star, TrendingUp, Calendar } from "lucide-react";
import { CiLocationArrow1 } from "react-icons/ci";
import { GrNotes } from "react-icons/gr";
const STUDENTS_API = "https://lauratek.in:8000/trainer/my-students";
const COURSES_API = "https://lauratek.in:8000/trainer/courses";
const POST_REVIEW_API = "https://lauratek.in:8000/reviews/submit";
const GET_REVIEW_API =
  "https://lauratek.in:8000/reviews/reviews/trainer-view";

const PUT_REVIEW_API =
  "https://lauratek.in:8000/reviews/edit";

const DELETE_REVIEW_API =
  "https://lauratek.in:8000/reviews/delete";

interface Student {
  id: number;
  name: string;
}

interface Course {
  id: number;
  title: string;
}

interface Review {
  id: number;
  review_text: string;
  student_name: string;
  instructor_name: string;
  created_at: string;
}

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getTagsFromReview = (text: string) => {
  const textLower = text.toLowerCase();
  const tags = [];
  if (textLower.includes("excellent") || textLower.includes("great") || textLower.includes("good")) tags.push("Excellent");
  if (textLower.includes("fast") || textLower.includes("quick")) tags.push("Fast Learner");
  if (textLower.includes("improve") || textLower.includes("needs work") || textLower.includes("struggle")) tags.push("Needs Improvement");
  if (textLower.includes("hard") || textLower.includes("effort") || textLower.includes("dedicated")) tags.push("Hard Worker");

  if (tags.length === 0) tags.push("Feedback Provided");

  return tags.slice(0, 2);
};

const Performancereview = () => {
  const token = localStorage.getItem("access_token");

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [loading, setLoading] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const toggleReviewExpand = (id: number) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      const res = await axios.get(STUDENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load students");
      setStudents([]);
    }
  };

  /* ================= FETCH COURSES ================= */
  const fetchCourses = async () => {
    try {
      const res = await axios.get(COURSES_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load courses");
      setCourses([]);
    }
  };

  /* ================= GET REVIEWS ================= */
  const fetchReviews = async () => {
    if (!selectedStudentId || !selectedCourseId) {
      toast.error("Please select student and course");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(GET_REVIEW_API, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          student_id: selectedStudentId,
          course_id: selectedCourseId,
        },
      });

      setReviews(response.data);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to fetch reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= POST REVIEW ================= */
  const handleSubmit = async () => {
    if (!selectedStudentId || !selectedCourseId || !reviewText) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        POST_REVIEW_API,
        {
          student_id: selectedStudentId,
          course_id: selectedCourseId,
          review_text: reviewText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Review submitted successfully");
      setReviewText("");
      fetchReviews();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PUT (EDIT) ================= */
  const handleUpdate = async (reviewId: number) => {
    try {
      await axios.put(
        `${PUT_REVIEW_API}/${reviewId}`,
        {
          student_id: selectedStudentId,
          course_id: selectedCourseId,
          review_text: editText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Review updated successfully");
      setEditingId(null);
      fetchReviews();
    } catch {
      toast.error("Failed to update review");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (reviewId: number) => {
    try {
      await axios.delete(`${DELETE_REVIEW_API}/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Review deleted successfully");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const reversedReviews = reviews.slice().reverse();
  const totalPages = Math.ceil(reversedReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const paginatedReviews = reversedReviews.slice(indexOfFirstReview, indexOfLastReview);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full space-y-6">

        {/* ================= FORM CARD ================= */}
        <Card className="w-full shadow-sm border-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-[26px] font-bold">Performance Review</CardTitle>
            <p className="text-[14.5px] text-[#64748B]">Evaluate student performance and provide feedback</p>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Student */}
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

              {/* Course */}
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

            {/* Review */}
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

            {/* Buttons */}
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

        {/* ================= PERFORMANCE SUMMARY ================= */}
        {false && reviews.length > 0 && selectedStudentId && (
          <Card className="w-full shadow-sm border-gray-100 mb-6">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-xl font-bold text-gray-800">Performance Summary</h3>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">Improving</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 items-center">
                {/* Student Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-lg font-medium shadow-sm flex-shrink-0">
                    {getInitials(students.find(s => s.id === selectedStudentId)?.name || "Student")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{students.find(s => s.id === selectedStudentId)?.name || "Student"}</p>
                    <p className="text-[13px] text-gray-500">{reviews.length} Reviews</p>
                  </div>
                </div>

                {/* Current Course */}
                <div className="md:border-l border-gray-100 md:pl-6 md:ml-2">
                  <p className="text-[13px] text-gray-400 font-medium mb-2">Current Course</p>
                  <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[13px] font-semibold w-fit">
                    {courses.find(c => c.id === selectedCourseId)?.title || "Course"}
                  </span>
                </div>

                {/* Average Rating */}
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

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-[13px] text-gray-500 font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Last reviewed on {formatDate(reviews[reviews.length - 1]?.created_at || reviews[0]?.created_at)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= REVIEWS LIST ================= */}
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
                      {/* Left Content Wrapper */}
                      <div className="flex flex-1 w-full flex-col md:flex-row gap-6">

                        {/* ID */}
                        <div className="hidden md:flex w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-600 font-bold rounded-xl items-center justify-center">
                          {indexOfFirstReview + index + 1}
                        </div>

                        {/* Main Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                          {/* Student */}
                          <div>
                            <p className="text-[13px] text-gray-400 mb-2">Student</p>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                                {getInitials(review.student_name)}
                              </div>
                              <span className="text-[15px] font-semibold text-gray-800">{review.student_name}</span>
                            </div>
                          </div>

                          {/* Instructor */}
                          <div>
                            <p className="text-[13px] text-gray-400 mb-2">Instructor</p>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                                {getInitials(review.instructor_name)}
                              </div>
                              <span className="text-[15px] font-semibold text-gray-800">{review.instructor_name}</span>
                            </div>
                          </div>

                          {/* Review Text */}
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

                      {/* Actions */}
                      <div className="flex flex-row items-center justify-center gap-3 mt-4 md:mt-0 md:ml-6 md:pl-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 w-full md:w-auto h-full">
                        <>
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
                        </>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Navigation */}
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
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-full overflow-hidden border border-white/20">
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Pencil className="w-5 h-5" />
                </div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight">Edit Review</h2>
              </div>
              <button
                onClick={() => setEditingId(null)}
                className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-col overflow-hidden bg-white">
              <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <Label className="block text-[14px] font-semibold text-slate-700 mb-2">Review Feedback <span className="text-rose-500">*</span></Label>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Update your review..."
                      className="w-full min-h-[140px] px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[15px] font-medium text-slate-700 outline-none shadow-sm resize-none"
                      maxLength={350}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="w-full sm:w-auto h-12 px-6 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-slate-800 font-bold text-[15px] transition-all shadow-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleUpdate(editingId)}
                  disabled={loading || !editText}
                  className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white rounded-xl font-bold text-[15px] shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2.5 border-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Performancereview;