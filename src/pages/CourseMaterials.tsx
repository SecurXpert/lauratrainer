import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "./services/api/api";

import { Material, MaterialFormData } from "../components/CourseMaterials/CourseMaterialsTypes";
import CourseMaterialsHeader from "../components/CourseMaterials/CourseMaterialsHeader";
import CourseMaterialsMetrics from "../components/CourseMaterials/CourseMaterialsMetrics";
import CourseMaterialsFilter from "../components/CourseMaterials/CourseMaterialsFilter";
import CourseMaterialsGrid from "../components/CourseMaterials/CourseMaterialsGrid";
import CourseMaterialsPagination from "../components/CourseMaterials/CourseMaterialsPagination";
import CourseMaterialsFormModal from "../components/CourseMaterials/CourseMaterialsFormModal";

export default function CourseMaterials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
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
        <CourseMaterialsHeader 
          loadingAction={loadingAction}
          onAddClick={() => {
            resetForm();
            setShowForm(true);
          }}
        />

        <CourseMaterialsMetrics 
          selectedCourseId={selectedCourseId}
          totalMaterialCount={totalMaterialCount}
          materialsLength={materials.length}
          totalDocumentsCount={totalDocumentsCount}
        />

        <div className="space-y-6 mb-10">
          <CourseMaterialsFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            setFormCourseId={(id) => setForm(prev => ({ ...prev, courseId: id }))}
            courses={courses}
          />

          <CourseMaterialsGrid 
            loadingMaterials={loadingMaterials}
            materialsLength={materials.length}
            selectedCourseId={selectedCourseId}
            paginatedMaterials={paginatedMaterials}
            courses={courses}
            loadingAction={loadingAction}
            handleView={handleView}
            handleEdit={handleEdit}
            handleDownload={handleDownload}
            handleDelete={handleDelete}
          />

          <CourseMaterialsPagination 
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        <CourseMaterialsFormModal 
          showForm={showForm}
          isEditing={isEditing}
          loadingAction={loadingAction}
          loadingModules={loadingModules}
          form={form}
          setForm={setForm}
          fileName={fileName}
          courses={courses}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
          handleFileChange={handleFileChange}
        />
      </div>
    </div>
  );
}
