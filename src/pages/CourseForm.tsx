// src/pages/CourseForm.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Upload,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";

const API_BASE = "https://lauratek.in:8000/trainer/courses";

type Category = {
  id: number;
  name: string;
};

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const startDateRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "",
    language: "",
    category_id: "",
    status: "",
    startDate: "",
    duration: "",
    image: null as File | null,
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

  const formatFromDdMmYyyy = (dateStr: string) => {
    if (!dateStr) return "";
    const [dd, mm, yyyy] = dateStr.split("-");
    if (!dd || !mm || !yyyy) return dateStr;
    return `${yyyy}-${mm}-${dd}`;
  };

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
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
      form.append(key, value);
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

        {/* ================= HEADER (MATCHES ABOVE IMAGE BUTTONS & POSITIONS) ================= */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-sm group shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </button>
            <div>
              <h1 className="text-[30px] font-bold text-[#101828]">
                {isEdit ? "Edit Course" : "Add New Course"}
              </h1>
              <p className="text-[#6A7282] text-[17px] mt-1 font-inter">
                Create and configure a new course
              </p>
            </div>
          </div>
        </div>

        {/* ================= FORM BODY (STACKED VERTICAL FULL-WIDTH CARDS AS SHOWN IN IMAGE) ================= */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Card 1: Basic Information */}
          <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[19px] font-semibold text-[#101828] mb-5 leading-tight">Basic Information</h2>

            <div className="space-y-5">
              {/* Course Title */}
              <div className="space-y-2">
                <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
                  Course Title
                </Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 40);
                    setFormData(prev => ({ ...prev, title: value }));
                    if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                  }}
                  placeholder="Enter course title"
                  maxLength={40}
                  className={`w-full h-12 px-4 bg-white border ${errors.title ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
                    } rounded-xl text-[17px] text-slate-800 placeholder:text-[17px] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 cursor-text`}
                />
                {errors.title && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
                  Description
                </Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 180);
                    setFormData(prev => ({ ...prev, description: value }));
                    if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                  }}
                  rows={5}
                  placeholder="Enter course description"
                  maxLength={180}
                  className={`w-full px-4 py-3 bg-white border ${errors.description ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
                    } rounded-xl text-[17px] text-slate-800 placeholder:text-[17px] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 resize-none min-h-[140px] cursor-text`}
                />
                {errors.description && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Card 2: Course Details */}
          <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#101828] mb-5 leading-tight">Course Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Level */}
              <div className="space-y-2">
                <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
                  Level
                </Label>
                <div className="relative">
                  <select
                    value={formData.level}
                    onChange={(e) => {
                      handleSelectChange("level", e.target.value);
                      if (errors.level) setErrors(prev => ({ ...prev, level: "" }));
                    }}
                    className={`w-full h-12 px-4 bg-white border ${errors.level ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
                      } rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>All Levels</option>
                    <option value="basic">Basic</option>
                    <option value="midlevel">Midlevel</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.level && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.level}</p>}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
                  Language
                </Label>
                <div className="relative">
                  <select
                    value={formData.language}
                    onChange={(e) => {
                      handleSelectChange("language", e.target.value);
                      if (errors.language) setErrors(prev => ({ ...prev, language: "" }));
                    }}
                    className={`w-full h-12 px-4 bg-white border ${errors.language ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
                      } rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>All Programming Language</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="c++">C++</option>
                    <option value="react">React</option>
                    <option value="node">Node.js</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.language && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.language}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
                  Category
                </Label>
                <div className="relative">
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      handleSelectChange("category_id", e.target.value);
                      if (errors.category_id) setErrors(prev => ({ ...prev, category_id: "" }));
                    }}
                    className={`w-full h-12 px-4 bg-white border ${errors.category_id ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
                      } rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.category_id && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.category_id}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-[14px] text-slate-600 font-medium mb-1 block">
                  Status
                </Label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      handleSelectChange("status", e.target.value);
                      if (errors.status) setErrors(prev => ({ ...prev, status: "" }));
                    }}
                    className={`w-full h-12 px-4 bg-white border ${errors.status ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
                      } rounded-xl text-[14px] text-slate-800 font-medium focus:ring-0 focus-visible:ring-0 cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.status && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.status}</p>}
              </div>
            </div>
          </div>

          {/* Card 3: Schedule */}
          <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#101828] mb-5 leading-tight">Schedule</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
                  Start Date
                </Label>
                <div className="relative flex items-center">
                  {/* Visible display input */}
                  <input
                    type="text"
                    readOnly
                    placeholder="DD/MM/YYYY"
                    value={formData.startDate
                      ? formData.startDate.split("-").reverse().join("/")
                      : ""}
                    onClick={() => startDateRef.current?.showPicker?.()}
                    className={`w-full h-12 pl-4 pr-12 bg-white border ${errors.startDate ? "border-red-500" : "border-slate-200"} rounded-xl text-[17px] text-slate-800 placeholder:text-[14px] placeholder:text-slate-800 placeholder:font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer`}
                  />
                  {/* Hidden native date picker — no pointer events so icon stays clickable */}
                  <input
                    ref={startDateRef}
                    type="date"
                    name="startDate"
                    min={getStartDateMin()}
                    max={getStartDateMax()}
                    value={formData.startDate}
                    onChange={(e) => {
                      handleChange(e);
                      if (errors.startDate) setErrors(prev => ({ ...prev, startDate: "" }));
                    }}
                    className="absolute right-6 bottom-0 opacity-0 pointer-events-none w-0 h-0"
                    tabIndex={-1}
                  />
                  {/* Calendar icon — exact right position */}
                  <div
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center cursor-pointer rounded-r-xl"
                    onClick={() => startDateRef.current?.showPicker?.()}
                  >
                    <svg className="w-[18px] h-[18px] text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a3 3 0 013 3v11a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h1V3a1 1 0 011-1zm-2 6a1 1 0 000 2h12a1 1 0 100-2H6z" />
                    </svg>
                  </div>
                </div>
                {errors.startDate && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.startDate}</p>}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-[15px] text-slate-700 font-medium mb-1 block">
                  Duration
                </Label>
                <Input
                  name="duration"
                  value={formData.duration}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.duration) setErrors(prev => ({ ...prev, duration: "" }));
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  maxLength={2}
                  placeholder="e.g. 6 (in months)"
                  className={`w-full h-12 px-4 bg-white border ${errors.duration ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"} rounded-xl text-[17px] text-slate-800 placeholder:text-[14px] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 cursor-text`}
                />
                {errors.duration && <p className="text-red-500 text-[11.5px] font-semibold mt-1">{errors.duration}</p>}
              </div>
            </div>
          </div>

          {/* Card 4: Course Image */}
          <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[15px] font-semibold text-[#101828] mb-5 leading-tight">Course Image</h2>

            <div className="relative">
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="image-upload"
              />

              <label
                htmlFor="image-upload"
                className="w-full border border-dashed border-slate-300 rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50/50 hover:border-slate-400"
              >
                {/* Upload icon matching image */}
                <Upload className="w-12 h-12 text-slate-400 mb-3" strokeWidth={2} />
                <p className="text-[17px] text-slate-600 font-medium mb-1">
                  Drag and drop or click to upload
                </p>
                <p className="text-[15px] text-slate-400">
                  PNG, JPG or WEBP (max. 5MB)
                </p>

                {formData.image ? (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="New Preview"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-[#10B981] font-bold text-[11.5px] max-w-xs truncate shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Selected: {formData.image.name}</span>
                    </div>
                  </div>
                ) : existingImage ? (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <img
                      src={
                        existingImage.startsWith("http")
                          ? existingImage
                          : `https://lauratek.in:8000${existingImage.startsWith("/") ? "" : "/"}${existingImage}`
                      }
                      alt="Current Course"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                    />
                    <span className="text-[12.5px] text-slate-500 font-semibold">Current Course Image</span>
                  </div>
                ) : null}
              </label>
            </div>
          </div>

          {/* Action Buttons at the Bottom (Matches exact positions and styles) */}
          <div className="flex items-center justify-end gap-3 pt-4 pb-8">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-[14px] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-0"
            >
              {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/courses")}
              className="h-11 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[14px] rounded-xl shadow-sm transition-all"
            >
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CourseForm;