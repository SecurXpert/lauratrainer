import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import { API_BASE_URL } from "./services/api/api";
import { Course, Resource, formatLocalDate } from "../components/Resources/ResourcesTypes";
import ResourcesHeader from "../components/Resources/ResourcesHeader";
import ResourcesStats from "../components/Resources/ResourcesStats";
import ResourcesUploadForm from "../components/Resources/ResourcesUploadForm";
import ResourcesFilters from "../components/Resources/ResourcesFilters";
import ResourcesTable from "../components/Resources/ResourcesTable";
import ResourcesPagination from "../components/Resources/ResourcesPagination";
import ResourcesDeletePopup from "../components/Resources/ResourcesDeletePopup";

const COURSE_API = `${API_BASE_URL}/trainer/courses`;
const RESOURCE_UPLOAD_API = `${API_BASE_URL}/resources/upload`;
const RESOURCE_GET_API = `${API_BASE_URL}/resources/instructor`;
const RESOURCE_UPDATE_API = `${API_BASE_URL}/resources/update`;
const RESOURCE_DELETE_API = `${API_BASE_URL}/resources/delete`;

const Resources = () => {
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
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
  // const zipFilesCount = resources.filter(res => res.file_type && res.file_type.toLowerCase().includes('zip')).length;

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
      <ResourcesHeader showForm={showForm} setShowForm={setShowForm} />

      <div className="w-full space-y-6 p-2 md:p-3 flex-1">
        <ResourcesStats 
          totalResourcesCount={resources.length}
          totalFilesCount={totalFilesCount}
        />

        {showForm && (
          <ResourcesUploadForm 
            isEdit={isEdit}
            setShowForm={setShowForm}
            resetForm={resetForm}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            formData={formData}
            courses={courses}
            file={file}
            handleFileChange={handleFileChange}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            isDragging={isDragging}
            loading={loading}
          />
        )}

        <ResourcesFilters 
          resourceSearch={resourceSearch}
          setResourceSearch={setResourceSearch}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          selectedCourseId={selectedCourseId}
          handleCourseSelectForList={handleCourseSelectForList}
          courses={courses}
          handleReset={() => { setResourceSearch(''); setSelectedCourseId(''); setDateFilter(''); fetchResources(''); }}
        />

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredResources.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(filteredResources.length, currentPage * itemsPerPage)} of {filteredResources.length} resources
          </p>
        </div>
        
        <ResourcesTable 
          resources={resources}
          paginatedResources={paginatedResources}
          courses={courses}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
        />

        <ResourcesPagination 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />

        <ResourcesDeletePopup 
          deleteSuccessPopup={deleteSuccessPopup}
        />
      </div>
    </div>
  );
};

export default Resources;