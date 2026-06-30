import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BASE_API = "https://lauratek.in:8000";

const CurriculumForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    order_index: 0,
    is_active: "" as boolean | "",
  });

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch curriculum data if editing
  useEffect(() => {
    if (isEdit && id && courses.length > 0) {
      const fetchCurriculum = async () => {
        try {
          const token = localStorage.getItem("access_token");
          
          // Fetch curriculum lists for all courses in parallel
          const curriculumPromises = courses.map(async (course) => {
            try {
              const res = await fetch(`${BASE_API}/courses/trainer/${course.id}/curriculum`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const list = await res.json();
                return { courseId: course.id, list };
              }
            } catch (e) {
              console.error(`Error fetching curriculum for course ${course.id}:`, e);
            }
            return { courseId: course.id, list: [] };
          });

          const results = await Promise.all(curriculumPromises);
          
          // Find the module that matches the target module ID
          let foundModule = null;
          let foundCourseId = "";
          for (const result of results) {
            const match = result.list.find((m: any) => String(m.id) === String(id));
            if (match) {
              foundModule = match;
              foundCourseId = String(result.courseId);
              break;
            }
          }

          if (foundModule) {
            setFormData({
              course_id: foundCourseId,
              title: foundModule.title || "",
              description: foundModule.description || "",
              order_index: foundModule.order_index ?? 0,
              is_active: foundModule.is_active ?? true,
            });
          } else {
            toast.error("Curriculum module not found in any of your courses.");
          }
        } catch {
          toast.error("Failed to load curriculum data");
        }
      };
      fetchCurriculum();
    }
  }, [id, isEdit, courses]);

  // Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch("https://lauratek.in:8000/trainer/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    };
    fetchCourses();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length > 300) {
      newErrors.description = "Description cannot exceed 300 characters";
    }
    if (!formData.course_id) newErrors.course_id = "Course is required";
    if (!formData.order_index && formData.order_index !== 0) newErrors.order_index = "Order is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "title") {
      finalValue = String(value);
    } else if (name === "description") {
      finalValue = String(value).replace(/[0-9]/g, "");
    } else if (name === "order_index") {
      finalValue = Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("access_token");

    const url = isEdit
      ? `${BASE_API}/courses/${formData.course_id}/curriculum/${id}`
      : `${BASE_API}/courses/${formData.course_id}/curriculum`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          order_index: formData.order_index,
          is_active: formData.is_active,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Curriculum updated" : "Curriculum created");
      navigate("/curriculum");
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="max-w-8xl mx-auto px-4 sm:px-6">
        <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md py-4 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-3 mb-6 sm:mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex items-start sm:items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/curriculum")}
              className="w-9 h-9 p-0 shrink-0 rounded-lg hover:bg-gray-100 transition-colors mt-0.5 sm:mt-0"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isEdit ? "Edit Curriculum" : "Add New Curriculum"}
              </h1>
              <p className="text-gray-500 text-[13px] sm:text-sm mt-0.5">
                Create and configure a new curriculum
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto h-10 px-7 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.45)] hover:shadow-[0_6px_20px_0_rgba(99,102,241,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none border-0"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Curriculum"
                  : "Add Curriculum"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/curriculum")}
              className="w-full sm:w-40 h-10 px-6 rounded-xl border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 font-medium text-sm transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 sm:mb-6">Basic Information</h2>

            <div className="space-y-5">
              {/* Curriculum Title */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Curriculum Title</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="Enter curriculum title"
                  className={`rounded-xl h-11 text-sm text-gray-800 placeholder:text-gray-400 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 ${errors.title ? "border-red-400" : ""}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Description</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  maxLength={180}
                  placeholder="Enter course description"
                  className={`rounded-xl text-sm text-gray-800 placeholder:text-gray-400 bg-white resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 ${errors.description ? "border-red-400" : ""}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum Details */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 sm:mb-6">Curriculum Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Select Course */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Course</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(v) => {
                    setFormData(prev => ({ ...prev, course_id: v }));
                    if (errors.course_id) setErrors(prev => ({ ...prev, course_id: "" }));
                  }}
                >
                  <SelectTrigger className={`rounded-xl h-11 text-sm text-gray-800 bg-white border-gray-200 focus:ring-1 focus:ring-indigo-400 ${errors.course_id ? "border-red-400" : ""}`}>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.title} (ID: {c.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Status</Label>
                <select
                  value={formData.is_active === "" ? "" : formData.is_active.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === "" ? "" : e.target.value === "true" }))}
                  className="w-full rounded-xl h-11 px-3 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  <option value="" disabled>Select Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

             

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CurriculumForm;