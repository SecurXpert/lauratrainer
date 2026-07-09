import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { API_BASE_URL } from "./services/api/api";

import { Category, CourseFormData } from "../components/CourseForm/CourseFormTypes";
import CourseFormHeader from "../components/CourseForm/CourseFormHeader";
import CourseFormBasicInfo from "../components/CourseForm/CourseFormBasicInfo";
import CourseFormDetails from "../components/CourseForm/CourseFormDetails";
import CourseFormSchedule from "../components/CourseForm/CourseFormSchedule";
import CourseFormImage from "../components/CourseForm/CourseFormImage";
import CourseFormActions from "../components/CourseForm/CourseFormActions";

const API_BASE = `${API_BASE_URL}/trainer/courses`;

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const startDateRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    level: "",
    language: "",
    category_id: "",
    status: "",
    startDate: "",
    duration: "",
    image: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  // Date bounds helpers
  const getTodayLocal = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getStartDateMin = () => getTodayLocal();

  const getStartDateMax = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch course if editing
  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch course");
        const rawData = await res.json();
        let data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data && data.data) {
          data = data.data;
        } else if (data && data.course) {
          data = data.course;
        }

        // Schedule comes as "DD-MM-YYYY" from backend. We need to convert it to "YYYY-MM-DD" for the date input.
        let parsedStartDate = "";

        if (data.schedule) {
          const parts = data.schedule.split("-");
          if (parts.length === 3) {
            // DD-MM-YYYY -> YYYY-MM-DD
            parsedStartDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            parsedStartDate = data.schedule;
          }
        }

        setFormData({
          title: data.title || data.name || data.course_name || data.course_title || "",
          description: data.description || data.course_description || data.desc || "",
          level: data.level?.toLowerCase() || "",
          language: data.language || "",
          category_id: data.category_id?.toString() || data.category?.id?.toString() || "",
          status: data.status?.toLowerCase() || "",
          startDate: parsedStartDate,
          duration: data.duration || "",
          image: null,
        });
        setExistingImage(data.image || null);
      } catch (err) {
        console.error("Error fetching course details:", err);
        toast.error("Failed to load course details for editing");
      }
    };

    fetchCourse();
  }, [id, isEdit]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get<Category[]>("/admin/categories");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCategories([]);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "image") {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size exceeds 5MB limit. Please upload a smaller image.");
          e.target.value = "";
          return;
        }
        setFormData(prev => ({ ...prev, image: file }));
      }
    } else {
      if (name === "description") {
        setFormData(prev => ({ ...prev, [name]: String(value).slice(0, 180) }));
      } else if (name === "duration") {
        const numValue = String(value).replace(/\D/g, "").slice(0, 2);
        setFormData(prev => ({ ...prev, [name]: numValue }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.level) newErrors.level = "Level is required";
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else if (!/^\d+$/.test(formData.duration.trim())) {
      newErrors.duration = "Only month numbers are allowed";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("access_token");
    const form = new FormData();

    const formatToDdMmYyyy = (iso: string) => {
      if (!iso) return "";
      const [yyyy, mm, dd] = iso.split("-");
      if (!yyyy || !mm || !dd) return iso;
      return `${dd}-${mm}-${yyyy}`;
    };

    Object.entries(formData).forEach(([key, value]) => {
      if (!value) return;
      if (key === "startDate" || key === "duration") return;
      form.append(key, value as string | Blob);
    });

    if (formData.startDate) {
      form.append("schedule", formatToDdMmYyyy(String(formData.startDate)));
    }

    // Explicitly append duration above the fetch (get/post) method
    if (formData.duration) {
      form.append("duration", String(formData.duration));
    }

    try {
      const res = await fetch(
        isEdit ? `${API_BASE}/${id}` : API_BASE,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Course updated successfully!" : "Course created successfully!");
      navigate("/courses");
    } catch {
      toast.error("Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-2 md:p-3">
      <div className="w-full flex flex-col gap-6">

        <CourseFormHeader 
          isEdit={isEdit} 
          onBack={() => navigate("/courses")} 
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <CourseFormBasicInfo 
            formData={formData} 
            errors={errors}
            onChangeTitle={(title) => {
              setFormData(prev => ({ ...prev, title }));
              if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
            }}
            onChangeDescription={(description) => {
              setFormData(prev => ({ ...prev, description }));
              if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
            }}
          />

          <CourseFormDetails 
            formData={formData}
            errors={errors}
            categories={categories}
            onSelectChange={handleSelectChange}
          />

          <CourseFormSchedule 
            formData={formData}
            errors={errors}
            startDateRef={startDateRef}
            minDate={getStartDateMin()}
            maxDate={getStartDateMax()}
            onChangeStartDate={handleChange}
            onChangeDuration={handleChange}
          />

          <CourseFormImage 
            formDataImage={formData.image}
            existingImage={existingImage}
            onChangeImage={handleChange}
          />

          <CourseFormActions 
            loading={loading}
            isEdit={isEdit}
            onCancel={() => navigate("/courses")}
            onSubmit={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default CourseForm;