import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Plus, Edit, Trash2, Eye, FileText, Video, Download, Link, X, Search, ChevronDown, Calendar } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";

interface Material {
  id: number;
  title: string;
  module_id?: string | null;
  file_url?: string;
  uploaded_by?: string;
  created_at?: string;
  course_title?: string;
  course_id?: number | string;
}

interface MaterialFormData {
  courseId: string;
  title: string;
  moduleId: string;
  uploadedBy: string;
  file: File | null;
}

export default function CourseMaterials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(
    null,
  );
  const [loadingAction, setLoadingAction] = useState(false);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [totalMaterialCount, setTotalMaterialCount] = useState<number>(0);
  const [totalDocumentsCount, setTotalDocumentsCount] = useState<number>(0);

  const [form, setForm] = useState<MaterialFormData>({
    courseId: "",
    title: "",
    moduleId: "",
    uploadedBy: "",
    file: null,
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Reset page when course changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId]);

  const fetchModulesForCourse = async (cId: string) => {
    console.log("fetchModulesForCourse starting for course ID:", cId);
    if (!cId) {
      setCourseModules([]);
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("fetchModulesForCourse: No access token found in localStorage.");
      return;
    }

    setLoadingModules(true);
    try {
      const url = `${API_BASE_URL}/courses/trainer/${cId}/curriculum`;
      console.log("fetchModulesForCourse: Fetching from URL:", url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchModulesForCourse: HTTP Status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("fetchModulesForCourse: Received curriculum data:", data);
        if (Array.isArray(data)) {
          setCourseModules(data);
          if (data.length > 0) {
            setForm(prev => {
              const hasValidModule = data.some(m => String(m.id) === String(prev.moduleId));
              console.log("fetchModulesForCourse: hasValidModule:", hasValidModule, "current moduleId:", prev.moduleId);
              if (!hasValidModule) {
                const defaultModId = String(data[0].id);
                console.log("fetchModulesForCourse: Auto-selecting first module ID:", defaultModId);
                return { ...prev, moduleId: defaultModId };
              }
              return prev;
            });
          } else {
            console.log("fetchModulesForCourse: Curriculum data array is empty.");
          }
        } else {
          console.warn("fetchModulesForCourse: Received data is not an array:", data);
          setCourseModules([]);
        }
      } else {
        console.error("fetchModulesForCourse: API response not OK. Status:", res.status);
        setCourseModules([]);
      }
    } catch (err) {
      console.error("fetchModulesForCourse: Failed to fetch modules due to error:", err);
      setCourseModules([]);
    } finally {
      console.log("fetchModulesForCourse: Completed. Setting loadingModules to false.");
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    if (showForm && form.courseId) {
      console.log("Triggering fetchModulesForCourse because showForm and/or courseId changed. courseId:", form.courseId);
      fetchModulesForCourse(form.courseId);
    } else if (!showForm) {
      setCourseModules([]);
    }
  }, [form.courseId, showForm]);

  /* ---------------- FETCH MATERIALS ---------------- */

  useEffect(() => {
    fetchCourses();
    fetchTotalMaterialCount();
  }, []);

  const fetchTotalMaterialCount = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/trainer/courses/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Handle both simple number and object formats including course_count
        const count = typeof data === 'number' ? data : (data?.course_count || data?.count || data?.total || 0);
        setTotalMaterialCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch total material count:", err);
    }
  };

  const fetchTotalDocumentsCount = async (coursesList = courses) => {
    const token = localStorage.getItem("access_token");
    if (!token || coursesList.length === 0) return;
    try {
      let totalCount = 0;
      const promises = coursesList.map(async (course) => {
        try {
          const res = await fetch(`${API_BASE_URL}/courses/${course.id}/materials`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            let materialsArray = [];
            if (Array.isArray(data)) {
              materialsArray = data;
            } else if (data && Array.isArray(data.materials)) {
              materialsArray = data.materials;
            } else if (data && Array.isArray(data.data)) {
              materialsArray = data.data;
            }
            totalCount += materialsArray.length;
          }
        } catch (err) {
          console.error(`Failed to fetch count for course ${course.id}:`, err);
        }
      });
      await Promise.all(promises);
      setTotalDocumentsCount(totalCount);
    } catch (err) {
      console.error("Failed to fetch total documents count:", err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchMaterials(selectedCourseId);
    } else if (courses.length > 0) {
      fetchAllMaterials();
    } else {
      setMaterials([]);
      setLoadingMaterials(false);
    }
  }, [selectedCourseId, courses]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/trainer/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
        fetchTotalDocumentsCount(data);
        // Do NOT auto-select the first course on refresh. Show "Select Course" by default.
        setSelectedCourseId("");
        setForm(prev => ({ ...prev, courseId: "" }));
      } else {
        setCourses([]);
        console.error("Courses response is not an array:", data);
      }
    } catch (err) {
      console.error("fetchCourses error:", err);
      toast.error("Failed to load courses");
      setCourses([]);
    }
  };

  const fetchMaterials = async (courseId: string) => {
    console.log("fetchMaterials called for courseId:", courseId);
    if (!courseId) return;
    setLoadingMaterials(true);
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login again");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const url = `${API_BASE_URL}/courses/${courseId}/materials`;
      console.log("fetchMaterials: Fetching from URL:", url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchMaterials: HTTP Status:", res.status);

      if (!res.ok) throw new Error("Failed to load materials");

      const data = await res.json();
      console.log("fetchMaterials: Received raw data:", data);
      let materialsArray = [];
      if (Array.isArray(data)) {
        materialsArray = data;
      } else if (data && Array.isArray(data.materials)) {
        materialsArray = data.materials;
      } else if (data && Array.isArray(data.data)) {
        materialsArray = data.data;
      } else {
        console.error("fetchMaterials: Materials response is not an array:", data);
      }

      // Map course_id and course_title to make sure they are populated for UI rendering
      const mappedData = materialsArray.map((item: any) => ({
        ...item,
        course_id: courseId,
        course_title: courses.find(c => String(c.id) === String(courseId))?.title || "Unknown Course"
      }));

      // Sort by newest first (created_at descending, fallback to id descending)
      mappedData.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });

      console.log("fetchMaterials: Setting materials to:", mappedData);
      setMaterials(mappedData);
    } catch (err: any) {
      console.error("fetchMaterials error:", err);
      toast.error(err.message || "Could not load course materials");
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchAllMaterials = async () => {
    setLoadingMaterials(true);
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login again");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const allMaterials: Material[] = [];
      const promises = courses.map(async (course) => {
        try {
          const res = await fetch(`${API_BASE_URL}/courses/${course.id}/materials`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            let materialsArray = [];
            if (Array.isArray(data)) {
              materialsArray = data;
            } else if (data && Array.isArray(data.materials)) {
              materialsArray = data.materials;
            } else if (data && Array.isArray(data.data)) {
              materialsArray = data.data;
            }

            if (materialsArray.length > 0) {
              const mappedData = materialsArray.map((item: any) => ({
                ...item,
                course_title: course.title,
                course_id: course.id
              }));
              allMaterials.push(...mappedData);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch materials for course ${course.id}:`, err);
        }
      });

      await Promise.all(promises);

      // Sort by newest first (created_at descending, fallback to id descending)
      allMaterials.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });

      setMaterials(allMaterials);
      setTotalDocumentsCount(allMaterials.length);
    } catch (err: any) {
      toast.error("Could not load all course materials");
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  /* ---------------- FETCH SINGLE MATERIAL ---------------- */

  const fetchSingleMaterial = async (materialId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${form.courseId}/materials/${materialId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to load material");

      const data = await res.json();

      setForm({
        courseId: form.courseId,
        title: data.title || "",
        moduleId: data.module_id || "",
        uploadedBy: data.uploaded_by || "",
        file: null,
      });

      setFileName(
        "Current file: " + (data.file_url?.split("/").pop() || "unknown"),
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load material details");
    }
  };

  /* ---------------- IMAGE CHECK FUNCTION (ADDED) ---------------- */

  const isImageFile = (url?: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  /* ---------------- FORM HANDLERS ---------------- */

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setForm((prev) => ({ ...prev, file: selectedFile }));
      setFileName(selectedFile.name);
    } else {
      setForm((prev) => ({ ...prev, file: null }));
      setFileName("No file chosen");
    }
  };

  const resetForm = () => {
    setForm({
      courseId: selectedCourseId || "",
      title: "",
      moduleId: "",
      uploadedBy: "",
      file: null,
    });

    setFileName("No file chosen");
    setShowForm(false);
    setIsEditing(false);
    setEditingMaterialId(null);
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login again");
      return;
    }

    if (!form.courseId) {
      toast.error("Course is required");
      return;
    }

    if (!String(form.title ?? '').trim()) {
      toast.error("Title is required");
      return;
    }

    if (!String(form.moduleId ?? '').trim()) {
      toast.error("Module ID is required");
      return;
    }

    // File is only strictly required if we are NOT editing
    if (!isEditing && !form.file) {
      toast.error("File is required");
      return;
    }

    setLoadingAction(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("course_id", String(form.courseId));

      if (form.moduleId) {
        formData.append("module_id", String(form.moduleId));
      }

      if (form.uploadedBy) {
        formData.append("uploaded_by", String(form.uploadedBy));
      }

      // Only append file if one was actually selected (important for edits)
      if (form.file) {
        formData.append("file", form.file);
      }

      const url = isEditing
        ? `${API_BASE_URL}/courses/${Number(form.courseId)}/materials/${editingMaterialId}`
        : `${API_BASE_URL}/courses/${Number(form.courseId)}/materials`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("SUBMISSION ERROR:", errorText);
        throw new Error(isEditing ? "Update failed" : "Upload failed");
      }

      toast.success(isEditing ? "Material updated successfully" : "Material uploaded successfully");

      // Refresh list
      if (selectedCourseId) {
        await fetchMaterials(selectedCourseId);
      } else {
        await fetchAllMaterials();
      }
      fetchTotalDocumentsCount();

      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setLoadingAction(false);
    }
  };
  /* ---------------- EDIT & DELETE ---------------- */

  const handleEdit = (material: Material) => {
    setIsEditing(true);
    setEditingMaterialId(material.id); // ✅ important
    setShowForm(true);

    setForm({
      courseId: String(material.course_id || form.courseId || selectedCourseId || ""),
      title: material.title || "",
      moduleId: material.module_id != null ? String(material.module_id) : "",
      uploadedBy: material.uploaded_by || "",
      file: null,
    });
  };

  const handleDelete = async (materialId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoadingAction(true);

    try {
      const materialItem = materials.find(m => m.id === materialId);
      const courseId = materialItem?.course_id || form.courseId || selectedCourseId;
      if (!courseId) {
        throw new Error("Course ID not found for this material");
      }

      const res = await fetch(
        `${API_BASE_URL}/courses/${courseId}/materials/${materialId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to delete material");

      toast.success("Material deleted successfully");
      if (selectedCourseId) {
        await fetchMaterials(selectedCourseId);
      } else {
        await fetchAllMaterials();
      }
      fetchTotalDocumentsCount();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete material");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.loading("Starting download...", { id: "download-toast" });
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'material';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download complete!", { id: "download-toast" });
    } catch (err) {
      console.error("Force download failed, falling back to new tab", err);
      toast.dismiss("download-toast");
      window.open(url, "_blank");
    }
  };

  // Filter materials based on search term and date
  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch = mat.title.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateFilter) {
      if (mat.created_at) {
        const matDate = new Date(mat.created_at).toISOString().split('T')[0];
        matchesDate = matDate === dateFilter;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b p-2 md:p-3 from-slate-50 to-slate-100">
      <div className="w-full">
        {/* HEADER */}
        <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-5 sm:mb-7 border-b border-slate-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold">Course Materials</h1>
            <p className="text-[#64748B]">
              Manage learning materials and resources
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-[0_10px_22px_rgba(126,58,242,0.35)]"
            disabled={loadingAction}
          >
            <Plus className="h-5 w-5" />
            Add Material
          </Button>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
            <p className="text-[13px] text-gray-500 font-medium mb-1">Total Courses</p>
            <h3 className="text-3xl font-bold text-[#0F172A]">{selectedCourseId ? 1 : totalMaterialCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
            <p className="text-[13px] text-gray-500 font-medium mb-1">Documents</p>
            <h3 className="text-3xl font-bold text-[#2563EB]">{selectedCourseId ? materials.length : totalDocumentsCount}</h3>
          </div>
        </div>

        {/* MATERIAL GRID */}
        <div className="space-y-6 mb-10">
          {/* Filters & Search Bar */}
          <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-sm border border-slate-100/80">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-0 focus:border-slate-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Date Filter */}
              <div className="relative w-full sm:w-48">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-0 focus:border-slate-200 focus:bg-white transition-colors text-sm font-medium text-slate-700 appearance-none cursor-pointer"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Course Selector */}
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setForm(prev => ({ ...prev, courseId: e.target.value }));
                  }}
                  className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-0 focus:border-slate-200 focus:bg-white transition-colors text-sm font-medium text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => {
                    const title = course.title || `Course #${course.id}`;
                    const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                    return (
                      <option key={course.id} value={course.id}>
                        {displayTitle} (ID: {course.id})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {loadingMaterials ? (
            <div className="p-20 text-center text-slate-400 bg-white rounded-2xl border">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="font-medium">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="p-20 text-center text-slate-400 bg-white rounded-2xl border">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-slate-500">
                {selectedCourseId ? "No materials uploaded yet for this course." : "No materials available across any course."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedMaterials.map((mat) => {
                  const isVideo = mat.file_url?.toLowerCase().endsWith('.mp4');
                  const courseTitle = mat.course_title || courses.find(c => String(c.id) === String(selectedCourseId))?.title || "Unknown Course";

                  return (
                    <div
                      key={mat.id}
                      className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden group"
                    >
                      <div className="p-6">
                        <div className="flex gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isVideo ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {isVideo ? <Video className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-lg leading-snug truncate group-hover:text-blue-600 transition-colors">
                              {mat.title}
                            </h3>
                            <p className="text-slate-500 text-[14px] mt-1">{courseTitle}</p>
                            <div className="flex items-center gap-3 mt-3 text-[13px] text-slate-500 font-medium">
                              <span>{mat.created_at ? new Date(mat.created_at).toISOString().split('T')[0] : '2026-03-20'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-white border-t border-slate-200/70 flex items-center gap-3">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 h-10 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] rounded-2xl text-[14px] font-semibold transition-all border border-slate-200/40 shadow-sm"
                          onClick={() => mat.file_url && handleView(mat.file_url)}
                        >
                          <Eye className="w-[18px] h-[18px] text-[#334155]" />
                          View
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-2 h-10 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] rounded-2xl text-[14px] font-semibold transition-all border border-blue-100/40 shadow-sm"
                          onClick={() => handleEdit(mat)}
                        >
                          <Edit className="w-[18px] h-[18px] text-[#2563EB]" />
                          Edit
                        </button>
                        <button
                          className="w-12 h-10 flex items-center justify-center rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] transition-all border border-slate-200/40 shadow-sm shrink-0"
                          onClick={() => mat.file_url && handleDownload(mat.file_url, mat.title)}
                          title="Download"
                        >
                          <Download className="w-[18px] h-[18px] text-[#334155]" />
                        </button>
                        <button
                          className="w-12 h-10 flex items-center justify-center rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] transition-all border border-red-100/40 shadow-sm shrink-0"
                          onClick={() => handleDelete(mat.id)}
                          disabled={loadingAction}
                          title="Delete"
                        >
                          <Trash2 className="w-[18px] h-[18px] text-[#EF4444]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 pt-6 border-t border-slate-200/60">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:hover:bg-[#F8FAFC] text-slate-700 rounded-xl text-[13px] font-semibold border border-slate-200/40 shadow-sm transition-all"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-[13px] font-bold transition-all ${currentPage === i + 1
                            ? 'bg-[#EFF6FF] text-[#2563EB] border border-blue-100/40 shadow-sm'
                            : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-slate-600 border border-slate-200/40 shadow-sm'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:hover:bg-[#F8FAFC] text-slate-700 rounded-xl text-[13px] font-semibold border border-slate-200/40 shadow-sm transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload / Edit Form Modal */}
        {/* Upload / Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/50">
            <div className="flex min-h-full items-end justify-center p-4 pb-10 sm:items-center sm:p-4 sm:py-8">
              <div
                className="flex min-h-0 w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[calc(100dvh-4rem)] sm:max-h-[min(90dvh,44rem)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="material-modal-title"
              >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
                  <h2 id="material-modal-title" className="min-w-0 text-base font-semibold text-blue-600 sm:text-lg">
                    {isEditing ? "Edit Material" : "Add Material"}
                  </h2>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loadingAction}
                    className="shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 no-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Course Select Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course
                      </label>
                      <select
                        id="courseId"
                        name="courseId"
                        value={form.courseId}
                        onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
                        required
                        disabled={loadingAction}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm bg-white"
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => {
                          const title = course.title || `Course #${course.id}`;
                          const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                          return (
                            <option key={course.id} value={course.id}>
                              {displayTitle} (ID: {course.id})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Enter Title"
                        value={form.title}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 25);
                          setForm((prev) => ({ ...prev, title: val }));
                        }}
                        maxLength={25}
                        required
                        disabled={loadingAction}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                      />
                    </div>

                    {/* Module ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="moduleId"
                          name="moduleId"
                          placeholder="e.g., 37"
                          value={form.moduleId}
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 10);
                            setForm((prev) => ({ ...prev, moduleId: val }));
                          }}
                          maxLength={10}
                          required
                          disabled={loadingAction}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                        />
                        {loadingModules && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Upload Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File
                      </label>
                      <div
                        onClick={() => !loadingAction && document.getElementById("file")?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
                      >
                        <input
                          id="file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={loadingAction}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.md,image/*"
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-1">
                          <Plus className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-[13px] text-gray-600 font-medium text-center">
                          Drag & drop file or click to upload
                        </p>
                        <p className="text-[11px] text-gray-400 text-center mt-1">
                          {fileName !== "No file chosen" ? (fileName.length > 40 ? fileName.substring(0, 37) + "..." : fileName) : "Accepts: PDF, DOC, ZIP, Images"}
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loadingAction}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
                      >
                        {loadingAction ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditing ? "Updating..." : "Uploading..."}
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
