import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.122:10000';

interface Material {
  id: number;
  title: string;
  module_id?: string | null;
  file_url?: string;
  uploaded_by?: string;
  created_at?: string;
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
    null
  );
  const [loadingAction, setLoadingAction] = useState(false);
  const [fileName, setFileName] = useState<string>('No file chosen');

  const [form, setForm] = useState<MaterialFormData>({
    courseId: '1',
    title: '',
    moduleId: '',
    uploadedBy: '',
    file: null,
  });

  /* ---------------- FETCH MATERIALS ---------------- */

  useEffect(() => {
    fetchMaterials();
  }, [form.courseId]);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    const token = localStorage.getItem('access_token');

    if (!token) {
      toast.error('Please login again');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${form.courseId}/materials`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to load materials');

      const data = await res.json();
      setMaterials(data);
    } catch (err: any) {
      toast.error(err.message || 'Could not load course materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  /* ---------------- FETCH SINGLE MATERIAL ---------------- */

  const fetchSingleMaterial = async (materialId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${form.courseId}/materials/${materialId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to load material');

      const data = await res.json();

      setForm({
        courseId: form.courseId,
        title: data.title || '',
        moduleId: data.module_id || '',
        uploadedBy: data.uploaded_by || '',
        file: null,
      });

      setFileName(
        'Current file: ' + (data.file_url?.split('/').pop() || 'unknown')
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to load material details');
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
      setFileName('No file chosen');
    }
  };

  const resetForm = () => {
    setForm({
      courseId: form.courseId,
      title: '',
      moduleId: '',
      uploadedBy: '',
      file: null,
    });

    setFileName('No file chosen');
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

  if (!form.title.trim()) {
    toast.error("Title is required");
    return;
  }

  if (!form.file) {
    toast.error("File is required");
    return;
  }

  setLoadingAction(true);

  try {
    const formData = new FormData();

    formData.append("title", form.title);

    if (form.moduleId) {
      formData.append("module_id", String(form.moduleId));
    }

    if (form.uploadedBy) {
      formData.append("uploaded_by", String(form.uploadedBy));
    }

    formData.append("file", form.file);

    const response = await fetch(
      `${API_BASE_URL}/courses/${Number(form.courseId)}/materials`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("UPLOAD ERROR:", errorText);
      throw new Error("Upload failed");
    }

    toast.success("Material uploaded successfully");

    await fetchMaterials();

    resetForm();
  } catch (error: any) {
    toast.error(error.message || "Upload failed");
  } finally {
    setLoadingAction(false);
  }
};
  /* ---------------- EDIT & DELETE ---------------- */

  const handleEdit = (material: Material) => {
  setIsEditing(true);
  setEditingMaterialId(material.id);   // ✅ important
  setShowForm(true);

  setForm({
    courseId: form.courseId,
    title: material.title || "",
    moduleId: material.module_id || "",
    uploadedBy: material.uploaded_by || "",
    file: null,
  });
};

  const handleDelete = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoadingAction(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${form.courseId}/materials/${materialId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to delete material');

      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete material');
    } finally {
      setLoadingAction(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Course Materials</h1>

          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="gap-2"
            disabled={loadingAction}
          >
            <Plus className="h-5 w-5" />
            Upload New
          </Button>
        </div>

        {/* MATERIAL LIST */}
        <div className="bg-white rounded-xl shadow border mb-10">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Available Materials
            </h2>
          </div>

          {loadingMaterials ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              Loading materials...
            </div>
          ) : materials.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No materials uploaded yet.
            </div>
          ) : (
            <div className="divide-y">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50"
                >
                  <div>
                    <h3 className="font-medium">{mat.title}</h3>

                    {mat.module_id && (
                      <p className="text-sm text-muted-foreground">
                        Module: {mat.module_id}
                      </p>
                    )}

                 {mat.file_url && (
  <div className="mt-4">
    <img
      src={mat.file_url}
      alt={mat.title}
      className="w-full max-w-md h-64 object-cover rounded-xl border shadow-md"
    />
  </div>
)}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(mat)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(mat.id)}
                      disabled={loadingAction}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Upload / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Material' : 'Upload Course Material'}
                </h2>
                <p className="text-muted-foreground">
                  {isEditing
                    ? 'Update title, module or replace file'
                    : 'Add lecture notes, slides, assignments or any learning resource'}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={resetForm}
                disabled={loadingAction}
              >
                Cancel
              </Button>
            </div>
 
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="courseId">Course ID *</Label>
                <Input
                  id="courseId"
                  name="courseId"
                  type="number"
                  min="1"
                  value={form.courseId}
                  onChange={handleTextChange}
                  required
                  disabled={loadingAction}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Week 4 – Introduction to React Hooks"
                  value={form.title}
                  onChange={handleTextChange}
                  required
                  disabled={loadingAction}
                />
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moduleId">Module ID</Label>
                  <Input
                    id="moduleId"
                    name="moduleId"
                    placeholder="e.g. MOD-102 or Week-4"
                    value={form.moduleId}
                    onChange={handleTextChange}
                    disabled={loadingAction}
                  />
                </div>
 
                <div className="space-y-2">
                  <Label htmlFor="uploadedBy">Uploaded By</Label>
                  <Input
  id="uploadedBy"
  name="uploadedBy"
  type="number"
  placeholder="Enter User ID (number)"
  value={form.uploadedBy}
  onChange={handleTextChange}
  disabled={loadingAction}
/>
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="file">
                  {isEditing ? 'Replace File (optional)' : 'File *'}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      id="file"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={loadingAction}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.md,image/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal overflow-hidden"
                      disabled={loadingAction}
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {fileName.length > 48 ? fileName.slice(0, 45) + '...' : fileName}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, PowerPoint, ZIP, images, text files
                </p>
              </div>
 
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 h-12 text-lg"
                  disabled={loadingAction || !form.title.trim()}
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isEditing ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : isEditing ? (
                    'Save Changes'
                  ) : (
                    'Upload Material'
                  )}
                </Button>
 
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-8"
                  onClick={resetForm}
                  disabled={loadingAction}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
 
 