import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "./services/api/api";
import { Student, Course, Review } from "../components/Performancereview/PerformancereviewTypes";
import PerformancereviewForm from "../components/Performancereview/PerformancereviewForm";
import PerformancereviewSummary from "../components/Performancereview/PerformancereviewSummary";
import PerformancereviewList from "../components/Performancereview/PerformancereviewList";
import PerformancereviewEditModal from "../components/Performancereview/PerformancereviewEditModal";

const STUDENTS_API = `${API_BASE_URL}/trainer/my-students`;
const COURSES_API = `${API_BASE_URL}/trainer/courses`;
const POST_REVIEW_API = `${API_BASE_URL}/reviews/submit`;
const GET_REVIEW_API = `${API_BASE_URL}/reviews/reviews/trainer-view`;
const PUT_REVIEW_API = `${API_BASE_URL}/reviews/edit`;
const DELETE_REVIEW_API = `${API_BASE_URL}/reviews/delete`;

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
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

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
        <PerformancereviewForm 
          students={students}
          courses={courses}
          setSelectedStudentId={setSelectedStudentId}
          setSelectedCourseId={setSelectedCourseId}
          reviewText={reviewText}
          setReviewText={setReviewText}
          handleSubmit={handleSubmit}
          fetchReviews={fetchReviews}
        />

        {/* ================= PERFORMANCE SUMMARY ================= */}
        {false && reviews.length > 0 && selectedStudentId && selectedCourseId && (
          <PerformancereviewSummary 
            reviews={reviews}
            students={students}
            courses={courses}
            selectedStudentId={selectedStudentId}
            selectedCourseId={selectedCourseId}
          />
        )}

        {/* ================= REVIEWS LIST ================= */}
        <PerformancereviewList 
          loading={loading}
          reviews={reviews}
          paginatedReviews={paginatedReviews}
          indexOfFirstReview={indexOfFirstReview}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setEditingId={setEditingId}
          setEditText={setEditText}
          handleDelete={handleDelete}
        />
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingId && (
        <PerformancereviewEditModal 
          editingId={editingId}
          setEditingId={setEditingId}
          editText={editText}
          setEditText={setEditText}
          loading={loading}
          handleUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Performancereview;