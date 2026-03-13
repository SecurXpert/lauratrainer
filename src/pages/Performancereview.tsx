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
import { Loader2 } from "lucide-react";

const STUDENTS_API = "http://192.168.0.122:10000/trainer/my-students";
const COURSES_API = "http://192.168.0.122:10000/trainer/courses";
const POST_REVIEW_API = "http://192.168.0.122:10000/reviews/submit";
const GET_REVIEW_API =
  "http://192.168.0.122:10000/reviews/reviews/trainer-view";

const PUT_REVIEW_API =
  "http://192.168.0.122:10000/reviews/edit";

const DELETE_REVIEW_API =
  "http://192.168.0.122:10000/reviews/delete";

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

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      const res = await axios.get(STUDENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  /* ================= FETCH COURSES ================= */
  const fetchCourses = async () => {
    try {
      const res = await axios.get(COURSES_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses");
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

  return (
   <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

  {/* ================= FORM CARD ================= */}
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Performance Review</CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Student */}
        <div>
          <Label>Select Student</Label>
          <Select onValueChange={(value) => setSelectedStudentId(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose Student" />
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose Course" />
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
        <Label>Review</Label>
        <Textarea
          className="w-full"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="w-full sm:w-auto" onClick={handleSubmit}>
          Submit Review
        </Button>
        <Button
          className="w-full sm:w-auto"
          variant="outline"
          onClick={fetchReviews}
        >
          Get Reviews
        </Button>
      </div>

    </CardContent>
  </Card>


  {/* ================= REVIEWS LIST ================= */}
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Reviews List</CardTitle>
    </CardHeader>

    <CardContent>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500">
          No reviews found
        </p>
      ) : (
        <>
          {/* ===== TABLE (Desktop View) ===== */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Instructor</th>
                  <th className="p-3 text-left">Review</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b">
                    <td className="p-3">{review.id}</td>
                    <td className="p-3">{review.student_name}</td>
                    <td className="p-3">{review.instructor_name}</td>

                    <td className="p-3">
                      {editingId === review.id ? (
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                      ) : (
                        review.review_text
                      )}
                    </td>

                    <td className="p-3">{review.created_at}</td>

                    <td className="p-3 space-x-2">
                      {editingId === review.id ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdate(review.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingId(review.id);
                              setEditText(review.review_text);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(review.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* ===== MOBILE CARD VIEW ===== */}
          <div className="md:hidden space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-4 space-y-2">
                <p><strong>ID:</strong> {review.id}</p>
                <p><strong>Student:</strong> {review.student_name}</p>
                <p><strong>Instructor:</strong> {review.instructor_name}</p>

                {editingId === review.id ? (
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <p><strong>Review:</strong> {review.review_text}</p>
                )}

                <p className="text-sm text-gray-500">
                  {review.created_at}
                </p>

                <div className="flex gap-2 pt-2">
                  {editingId === review.id ? (
                    <>
                      <Button size="sm" onClick={() => handleUpdate(review.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(review.id);
                          setEditText(review.review_text);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </CardContent>
  </Card>
</div>
  );
};

export default Performancereview;