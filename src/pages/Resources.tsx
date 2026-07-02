import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const COURSE_API = "http://192.168.0.122:10000/trainer/courses";
const RESOURCE_UPLOAD_API = "http://192.168.0.122:10000/resources/upload";
const RESOURCE_GET_API = "http://192.168.0.122:10000/resources/instructor";
const RESOURCE_UPDATE_API = "http://192.168.0.122:10000/resources/update";

const Resources = () => {
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    file_type: "",
    external_url: "",
  });

  const [file, setFile] = useState<File | null>(null);

  /* ================= FETCH COURSES ================= */

  const fetchCourses = async () => {
    try {
      const res = await fetch(COURSE_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  /* ================= FETCH RESOURCES ================= */

  const fetchResources = async (courseId: string) => {
    if (!courseId) return;

    try {
      const res = await fetch(`${RESOURCE_GET_API}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResources(data);
    } catch {
      toast.error("Failed to fetch resources");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "file_type") {
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
    });

    setShowForm(true);
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
      });

      setFile(null);
      setShowForm(false);
      setIsEdit(false);
      setEditingResourceId(null);

      if (selectedCourseId) {
        fetchResources(selectedCourseId);
      }

    } catch {
      toast.error(isEdit ? "Update failed" : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resources</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Close Form" : "Add Resource"}
        </Button>
      </div>

      {/* FORM */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEdit ? "Update Resource" : "Add Resource"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid gap-2">
                <Label>Course</Label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>File Type</Label>
                <select
                  name="file_type"
                  value={formData.file_type}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="">Select Type</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">DOC</option>
                  <option value="mp4">MP4</option>
                  <option value="url">URL</option>
                </select>
              </div>

              {formData.file_type === "url" && (
                <Input
                  name="external_url"
                  value={formData.external_url}
                  onChange={handleChange}
                  placeholder="Enter URL"
                  required
                />
              )}

              {formData.file_type &&
                formData.file_type !== "url" && (
                  <Input
                    type="file"
                    accept={getAcceptType()}
                    onChange={handleFileChange}
                  />
                )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Uploading..."
                  : isEdit
                  ? "Update Resource"
                  : "Submit"}
              </Button>

            </form>
          </CardContent>
        </Card>
      )}

      {/* RESOURCE LIST */}
      <Card>
        <CardHeader>
          <CardTitle>View Course Resources</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <select
            value={selectedCourseId}
            onChange={handleCourseSelectForList}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          {resources.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">File</th>
                    <th className="p-2 border">Uploaded</th>
                  </tr>
                </thead>

                <tbody>
                  {resources.map((res) => (
                    <tr key={res.id} className="text-center">
                      <td className="border p-2">{res.id}</td>
                      <td className="border p-2">{res.title}</td>
                      <td className="border p-2">{res.file_type}</td>
                      <td className="border p-2 space-x-2">
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(res)}
                        >
                          Edit
                        </Button>
                      </td>
                      <td className="border p-2">
                        {new Date(res.uploaded_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
};

export default Resources;