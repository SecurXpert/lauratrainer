import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Download, Trash2, FileText, FileArchive, FileVideo, Link, Search, Filter, ChevronDown, RefreshCw, Calendar, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";

const COURSE_API = "https://lauratek.in:8000/trainer/courses";
const RESOURCE_UPLOAD_API = "https://lauratek.in:8000/resources/upload";
const RESOURCE_GET_API = "https://lauratek.in:8000/resources/instructor";
const RESOURCE_UPDATE_API = "https://lauratek.in:8000/resources/update";
const RESOURCE_DELETE_API = "https://lauratek.in:8000/resources/delete";

const Resources = () => {
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [resourceSearch, setResourceSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    file_type: "",
    external_url: "",
    duration_seconds: "",

  });

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [deleteSuccessPopup, setDeleteSuccessPopup] = useState<{ resourceName: string } | null>(null);
  const deletePopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDeleteSuccessPopup = (resourceName: string) => {
    if (deletePopupTimerRef.current) {
      clearTimeout(deletePopupTimerRef.current);
    }
    setDeleteSuccessPopup({ resourceName });
    deletePopupTimerRef.current = setTimeout(() => {
      setDeleteSuccessPopup(null);
      deletePopupTimerRef.current = null;
    }, 3000);
  };


  /* ================= FETCH COURSES ================= */

  const fetchCourses = async () => {
    try {
      const res = await fetch(COURSE_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      console.log("fetchCourses: Received data:", data);

      let coursesArray = [];
      if (Array.isArray(data)) {
        coursesArray = data;
      } else if (data && Array.isArray(data.courses)) {
        coursesArray = data.courses;
      } else if (data && Array.isArray(data.data)) {
        coursesArray = data.data;
      }

      setCourses(coursesArray);
    } catch (err) {
      console.error("fetchCourses error:", err);
      toast.error("Failed to load courses");
      setCourses([]);
    }
  };

  /* ================= FETCH RESOURCES ================= */

  const getDeletedIds = () => {
    try {
      const stored = localStorage.getItem("deletedResourceIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addDeletedId = (id: number) => {
    try {
      const deleted = getDeletedIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem("deletedResourceIds", JSON.stringify(deleted));
      }
    } catch (e) { }
  };

  const fetchResources = async (courseId: string) => {
    console.log("fetchResources called for courseId:", courseId);
    if (!courseId) {
      fetchAllResources();
      return;
    }

    try {
      const res = await fetch(`${RESOURCE_GET_API}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("fetchResources HTTP Status:", res.status);
      if (!res.ok) throw new Error("Failed to fetch resources");

      const data = await res.json();
      console.log("fetchResources raw data:", data);

      let resourcesArray = [];
      if (Array.isArray(data)) {
        resourcesArray = data;
      } else if (data && Array.isArray(data.resources)) {
        resourcesArray = data.resources;
      } else if (data && Array.isArray(data.data)) {
        resourcesArray = data.data;
      } else if (data && Array.isArray(data.materials)) {
        resourcesArray = data.materials;
      }

      // Ensure course_id is populated for each item
      const mappedData = resourcesArray.map((item: any) => ({
        ...item,
        course_id: item.course_id || courseId
      }));

      // Sort by newest first (created_at descending, fallback to id descending)
      mappedData.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });

      console.log("fetchResources setting resources:", mappedData);
      const deletedIds = getDeletedIds();
      setResources(mappedData.filter((r: any) => !deletedIds.includes(r.id)));
    } catch (err) {
      console.error("fetchResources error:", err);
      toast.error("Failed to fetch resources");
      setResources([]);
    }
  };

  const fetchAllResources = async () => {
    console.log("fetchAllResources called. Courses:", courses);
    if (!Array.isArray(courses) || courses.length === 0) return;
    try {
      const allPromises = courses.map(async (course) => {
        try {
          const res = await fetch(`${RESOURCE_GET_API}/${course.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            console.log(`fetchAllResources course ${course.id} data:`, data);
            let resourcesArray = [];
            if (Array.isArray(data)) {
              resourcesArray = data;
            } else if (data && Array.isArray(data.resources)) {
              resourcesArray = data.resources;
            } else if (data && Array.isArray(data.data)) {
              resourcesArray = data.data;
            } else if (data && Array.isArray(data.materials)) {
              resourcesArray = data.materials;
            }
            // Ensure course_id is populated for each item
            return resourcesArray.map((item: any) => ({
              ...item,
              course_id: item.course_id || course.id
            }));
          }
        } catch (e) {
          console.error(`Error fetching resources for course ${course.id}:`, e);
        }
        return [];
      });
      const results = await Promise.all(allPromises);
      const allData = results.flat();
      console.log("fetchAllResources setting final flat resources:", allData);

      // Sort by newest first (created_at descending, fallback to id descending)
      allData.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });

      const deletedIds = getDeletedIds();
      setResources(allData.filter((r: any) => !deletedIds.includes(r.id)));
    } catch (err) {
      console.error("Failed to fetch all resources:", err);
      setResources([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const hasFetchedAllRef = useRef(false);

  // Fetch all resources once on mount to populate the count cards.
  // hasFetchedAllRef ensures this never re-fires on re-renders or dropdown changes.
  useEffect(() => {
    if (Array.isArray(courses) && courses.length > 0 && !hasFetchedAllRef.current) {
      hasFetchedAllRef.current = true;
      fetchAllResources();
    }
  }, [courses]);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "title") {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: filteredValue,
      }));
    } else if (name === "file_type") {
      setFile(null);
      setFormData((prev) => ({
        ...prev,
        file_type: value,
        external_url: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCourseSelectForList = (e: any) => {
    const id = e.target.value;
    setSelectedCourseId(id);
    fetchResources(id);
  };

  const handleFileChange = (e: any) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const getAcceptType = () => {
    switch (formData.file_type) {
      case "pdf":
        return ".pdf";
      case "doc":
        return ".doc,.docx";
      case "mp4":
        return ".mp4";
      default:
        return "*";
    }
  };

  /* ================= EDIT FUNCTION ================= */

  const handleEdit = (resource: any) => {
    setIsEdit(true);
    setEditingResourceId(resource.id);

    setFormData({
      course_id: resource.course_id || "",
      title: resource.title || "",
      file_type: resource.file_type || "",
      external_url: resource.external_url || "",
      duration_seconds: resource.duration_seconds || "",
    });

    setShowForm(true);
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setFormData({
      course_id: "",
      title: "",
      file_type: "",
      external_url: "",
      duration_seconds: "",
    });
    setFile(null);
    setIsEdit(false);
    setEditingResourceId(null);
  };

  /* ================= SUBMIT (POST + PUT) ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();
      data.append("course_id", formData.course_id);
      data.append("title", formData.title);
      data.append("file_type", formData.file_type);

      if (formData.file_type === "url") {
        data.append("external_url", formData.external_url);
      } else if (file) {
        data.append("file", file);
      }

      const url = isEdit
        ? `${RESOURCE_UPDATE_API}/${editingResourceId}`
        : RESOURCE_UPLOAD_API;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error();

      toast.success(
        isEdit
          ? "Resource updated successfully"
          : "Resource uploaded successfully"
      );

      setFormData({
        course_id: "",
        title: "",
        file_type: "",
        external_url: "",
        duration_seconds: "",
      });

      setFile(null);
      setShowForm(false);
      setIsEdit(false);
      setEditingResourceId(null);

      fetchResources(selectedCourseId || "");

    } catch {
      toast.error(isEdit ? "Update failed" : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resObj: any) => {
    console.log("Attempting to delete resource:", resObj);
    try {
      setLoading(true);
      const res = await fetch(`${RESOURCE_DELETE_API}/${resObj.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let isGhostFile = false;
      if (!res.ok) {
        const errText = await res.text();
        console.error("Delete failed with status:", res.status, errText);

        // If the backend says the file is already gone, treat it as a success!
        if (errText.toLowerCase().includes("file not found") || errText.toLowerCase().includes("not found")) {
          console.log("File already missing on server, treating as success and removing from UI.");
          isGhostFile = true;
        } else {
          throw new Error(errText || "Delete failed");
        }
      }

      // Always persist the deleted ID so it stays hidden after refresh / re-login
      addDeletedId(resObj.id);
      // Immediately remove from local state
      setResources(prev => prev.filter(r => r.id !== resObj.id));

      if (!isGhostFile) {
        // Also re-fetch in background to stay in sync with the server
        fetchResources(selectedCourseId || "");
      }

      showDeleteSuccessPopup(resObj.title || "Unknown File");

    } catch (err: any) {
      console.error("Delete exception:", err);
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string, isExternalUrl: boolean) => {
    if (isExternalUrl) {
      window.open(url, "_blank");
      return;
    }

    try {
      toast.loading("Starting download...", { id: "download-toast" });
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'resource';
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

  /* ================= UI ================= */

  const formatLocalDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return '';
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = (res.title || '').toLowerCase().includes(resourceSearch.toLowerCase());

    let matchesDate = true;
    if (dateFilter) {
      if (res.uploaded_at) {
        const resDate = formatLocalDate(res.uploaded_at);
        matchesDate = resDate === dateFilter;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const totalFilesCount = resources.filter(res => {
    if (!res.file_type) return false;
    const type = res.file_type.toLowerCase();
    return type.includes('pdf') || type.includes('doc') || type.includes('mp4') || type.includes('url');
  }).length;
  const zipFilesCount = resources.filter(res => res.file_type && res.file_type.toLowerCase().includes('zip')).length;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [resourceSearch, selectedCourseId, dateFilter]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Adjust current page if it is out of bounds
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-50 px-2 md:px-3 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-transparent">
        <div>
          <h1 className="text-[24px] sm:text-[30px] font-bold">Resources</h1>
          <p className="text-[14px] sm:text-[16px] text-[#64748B]">Manage course materials and downloads</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto justify-center bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {showForm ? "Close Form" : "Upload Resource"}
        </Button>
      </div>

      <div className="w-full space-y-6 p-2 md:p-3 flex-1">

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
            <p className="text-[13px] text-gray-500 font-medium mb-1">Total Resources</p>
            <h3 className="text-3xl font-bold text-[#0F172A]">{resources.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
            <p className="text-[13px] text-gray-500 font-medium mb-1">Total Files</p>
            <h3 className="text-3xl font-bold text-[#2563EB]">{totalFilesCount}</h3>
          </div>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-[380px] w-full flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
                <h2 className="text-lg font-semibold text-blue-600">{isEdit ? "Update Resource" : "Add Resource"}</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto no-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      maxLength={30}
                      placeholder="Enter title"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder:text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Type
                    </label>
                    <select
                      name="file_type"
                      value={formData.file_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Type</option>
                      <option value="pdf">PDF</option>
                      <option value="doc">DOC</option>
                      <option value="mp4">MP4</option>
                      <option value="url">URL</option>
                    </select>
                  </div>

                  {formData.file_type === "url" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External URL
                      </label>
                      <Input
                        name="external_url"
                        value={formData.external_url}
                        onChange={handleChange}
                        placeholder="Enter URL"
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}

                  {formData.file_type &&
                    formData.file_type !== "url" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File
                        </label>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="file"
                            accept={getAcceptType()}
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                <Plus className="h-6 w-6 text-blue-600" />
                              </div>
                              <p className="text-sm text-gray-600">
                                {file ? file.name : "Drag & drop file or click to upload"}
                              </p>
                              <p className="text-xs text-gray-400">
                                Accepts: {formData.file_type.toUpperCase()}
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                  <Button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition mt-2"
                    disabled={loading}
                  >
                    {loading
                      ? isEdit
                        ? "Updating..."
                        : "Uploading..."
                      : isEdit
                        ? "Update Resource"
                        : "Submit"}
                  </Button>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCE LIST CONTROLS */}
        <div className="bg-white rounded-[24px] p-4 sm:p-7 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your resource list</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={resourceSearch}
                maxLength={30}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Right Side Group */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[140px] sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px] sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <select
                  value={selectedCourseId}
                  onChange={handleCourseSelectForList}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
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
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <button
                onClick={() => { setResourceSearch(''); setSelectedCourseId(''); setDateFilter(''); fetchResources(''); }}
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto mt-2 sm:mt-0"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredResources.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(filteredResources.length, currentPage * itemsPerPage)} of {filteredResources.length} resources
          </p>
        </div>
        {/* RESOURCE LIST CARD */}
        <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-[22px] overflow-hidden">
          <CardContent className="p-0">
            {resources.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileArchive className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No materials available</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="min-w-[800px] w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">File Name</th>
                      <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">Course</th>
                      {/* <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">Type</th> */}
                      {/* <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">Size</th> */}
                      <th className="py-4 px-6 text-left text-[13px] font-semibold text-[#101828] whitespace-nowrap">Upload Date</th>
                      {/* <th className="py-4 px-6 text-center text-[13px] font-semibold text-[#101828] whitespace-nowrap">Downloads</th> */}
                      <th className="py-4 px-6 text-right text-[13px] font-semibold text-[#101828] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {paginatedResources
                      .map((res) => {
                        const ft = (res.file_type || '').toLowerCase();
                        const isPdf = ft === 'pdf';
                        const isZip = ft === 'zip' || ft === 'doc';
                        const isVideo = ft === 'mp4';

                        const FileIcon = isPdf ? FileText : isZip ? FileArchive : isVideo ? FileVideo : Link;
                        const iconBg = isPdf ? 'bg-red-50' : isZip ? 'bg-blue-50' : isVideo ? 'bg-purple-50' : 'bg-slate-50';
                        const iconColor = isPdf ? 'text-red-600' : isZip ? 'text-blue-600' : isVideo ? 'text-purple-600' : 'text-slate-600';

                        const uploadDate = res.uploaded_at
                          ? formatLocalDate(res.uploaded_at) || '—'
                          : '—';

                        const courseName = courses.find((c) => String(c.id) === String(res.course_id))?.title || 'Web Development';

                        return (
                          <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                            {/* File Name */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                  <FileIcon className={`w-5 h-5 ${iconColor}`} />
                                </div>
                                <span className="font-medium text-black text-[14px] leading-tight break-words">{res.title}</span>
                              </div>
                            </td>

                            {/* Course */}
                            <td className="py-5 px-6 text-[14px] text-slate-500 font-medium break-words">{courseName}</td>

                            {/* Type badge */}
                            {/* <td className="py-5 px-6">
                              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                {res.file_type || '—'}
                              </span>
                            </td> */}

                            {/* Size */}
                            {/* <td className="py-5 px-6 text-[14px] text-slate-500 font-medium whitespace-nowrap">
                              {res.file_size ? `${(res.file_size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB'}
                            </td> */}

                            {/* Upload Date */}
                            <td className="py-5 px-6 text-[14px] text-slate-500 font-medium whitespace-nowrap">{uploadDate}</td>

                            {/* Downloads */}
                            {/* <td className="py-5 px-6 text-[14px] font-bold text-slate-900 text-center whitespace-nowrap">
                              {res.downloads ?? '45'}
                            </td> */}

                            {/* Actions */}
                            <td className="py-5 px-6">
                              <div className="flex items-center justify-end gap-3">
                                {res.file_url && (
                                  <button
                                    onClick={() => handleDownload(res.file_url, res.title, ft === 'url')}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                    title="Download"
                                  >
                                    <Download className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(res)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-600 transition-all border border-transparent hover:border-red-100"
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              Previous
            </button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isSec = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isSec
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Success Popup */}
        {deleteSuccessPopup && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
            role="status"
            aria-live="polite"
          >
            <div className="pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-green-200 bg-white p-4 shadow-lg">
              <div className="flex gap-3">
                <CheckCircle2 className="h-10 w-10 shrink-0 text-green-500" aria-hidden />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold text-gray-900">Deleted successfully</p>
                  <p className="mt-1 text-gray-600">
                    <span className="text-gray-500">Resource:</span>{' '}
                    <span className="font-medium text-gray-900 break-words">
                      {deleteSuccessPopup.resourceName}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Resources;