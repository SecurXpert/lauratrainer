// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Plus, Search, Trash2, Edit, Eye, Upload } from 'lucide-react';
// import { toast } from 'sonner';

// const API_BASE = 'http://192.168.0.122:10000/trainer/courses';

// const Courses = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [courses, setCourses] = useState([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     level: '',
//     language: '',
//     category_id: 0,
//     image: '',
//     status: '',
//     schedule: '',
//   });
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem('access_token');

//   const fetchCourses = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(API_BASE, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       if (!response.ok) {
//         throw new Error('Failed to fetch courses');
//       }
//       const data = await response.json();
//       setCourses(data);
//     } catch (error) {
//       toast.error('Error fetching courses');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'category_id' ? parseInt(value) || 0 : value,
//     }));
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       description: '',
//       level: '',
//       language: '',
//       category_id: 0,
//       image: '',
//       status: '',
//       schedule: '',
//     });
//   };

//   const handleOpenAdd = () => {
//     setIsEdit(false);
//     resetForm();
//     setIsDialogOpen(true);
//   };

//   const handleOpenEdit = (course) => {
//     setIsEdit(true);
//     setSelectedCourse(course);
//     setFormData({
//       title: course.title || '',
//       description: course.description || '',
//       level: course.level || '',
//       language: course.language || '',
//       category_id: course.category_id || 0,
//       image: course.image || '',
//       status: course.status || '',
//       schedule: course.schedule || '',
//     });
//     setIsDialogOpen(true);
//   };

//   const handleClose = () => {
//     setIsDialogOpen(false);
//     if (!isEdit) {
//       resetForm();
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!token) {
//       toast.error('No access token found');
//       return;
//     }

//     try {
//       setLoading(true);
//       const url = isEdit
//         ? `${API_BASE}/${selectedCourse.id}`
//         : API_BASE;
//       const method = isEdit ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to ${isEdit ? 'update' : 'add'} course`);
//       }

//       toast.success(isEdit ? 'Course updated successfully' : 'Course added successfully');
//       handleClose();
//       fetchCourses();
//     } catch (error) {
//       toast.error(`Error ${isEdit ? 'updating' : 'adding'} course`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (courseId) => {
//     if (!token) {
//       toast.error('No access token found');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE}/${courseId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete course');
//       }

//       toast.success('Course deleted successfully');
//       fetchCourses();
//     } catch (error) {
//       toast.error('Error deleting course');
//     }
//   };

//   const filteredCourses = courses.filter(course =>
//     course.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
//     course.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <h1 className="text-3xl font-bold">Courses Management</h1>
//         <div className="flex flex-wrap gap-2">
//           <Button className="gap-2" onClick={handleOpenAdd}>
//             <Plus className="w-4 h-4" />
//             Add Course
//           </Button>
//           <Button variant="outline" className="gap-2">
//             <Plus className="w-4 h-4" />
//             Add Multiple Courses
//           </Button>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <Card className="shadow-soft">
//         <CardContent className="pt-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//             <Input
//               placeholder="Search by Course ID or Title..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Courses Table */}
//       <Card className="shadow-soft">
//         <CardHeader>
//           <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left py-3 px-4">Course ID</th>
//                   <th className="text-left py-3 px-4">Course Title</th>
//                   <th className="text-left py-3 px-4">Level</th>
//                   <th className="text-left py-3 px-4">Language</th>
//                   <th className="text-left py-3 px-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCourses.map((course) => (
//                   <tr key={course.id} className="border-b hover:bg-muted/50">
//                     <td className="py-3 px-4 font-medium">{course.id}</td>
//                     <td className="py-3 px-4">{course.title}</td>
//                     <td className="py-3 px-4">{course.level}</td>
//                     <td className="py-3 px-4">{course.language}</td>
//                     <td className="py-3 px-4">
//                       <div className="flex flex-wrap gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => toast.success('Viewing curriculum')}
//                         >
//                           <Eye className="w-4 h-4 mr-1" />
//                           Curriculum
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => toast.success('Viewing materials')}
//                         >
//                           <Eye className="w-4 h-4 mr-1" />
//                           Materials
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => toast.success('Upload dialog opened')}
//                         >
//                           <Upload className="w-4 h-4 mr-1" />
//                           Upload
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleOpenEdit(course)}
//                         >
//                           <Edit className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => handleDelete(course.id)}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           {loading && <p className="text-center py-4">Loading...</p>}
//           {!loading && filteredCourses.length === 0 && (
//             <p className="text-center py-4 text-muted-foreground">No courses found.</p>
//           )}
//         </CardContent>
//       </Card>

//       {/* Add/Edit Course Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={handleClose}>
//         <DialogContent className="max-w-md z-[60]">
//           <DialogHeader>
//             <DialogTitle>{isEdit ? 'Edit Course' : 'Add Course'}</DialogTitle>
//             <DialogDescription>
//               {isEdit ? 'Update the course details below.' : 'Enter the course details below.'}
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmit}>
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="level">Level</Label>
//                 <Input
//                   id="level"
//                   name="level"
//                   value={formData.level}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="language">Language</Label>
//                 <Input
//                   id="language"
//                   name="language"
//                   value={formData.language}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="category_id">Category ID</Label>
//                 <Input
//                   id="category_id"
//                   name="category_id"
//                   type="number"
//                   value={formData.category_id}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="image">Image URL</Label>
//                 <Input
//                   id="image"
//                   name="image"
//                   value={formData.image}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="status">Status</Label>
//                 <Input
//                   id="status"
//                   name="status"
//                   value={formData.status}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="schedule">Schedule</Label>
//                 <Input
//                   id="schedule"
//                   name="schedule"
//                   value={formData.schedule}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="submit" disabled={loading}>
//                 {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Courses;




import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
 
const API_BASE = "http://192.168.0.122:10000/trainer/courses";
 
const Courses = () => {
  const token = localStorage.getItem("access_token");
 
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
 
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "",
    language: "",
    category_id: "",
    status: "",
    schedule: "",
    image: null,
  });
 
  /* ================= GET COURSES ================= */
 
  const fetchCourses = async () => {
    try {
      setLoading(true);
 
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      if (!res.ok) throw new Error();
 
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchCourses();
  }, []);
 
  /* ================= HANDLE INPUT ================= */
 
  const handleChange = (e) => {
    const { name, value, files } = e.target;
 
    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
 
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      level: "",
      language: "",
      category_id: "",
      status: "",
      schedule: "",
      image: null,
    });
  };
 
  /* ================= OPEN ADD ================= */
 
  const handleOpenAdd = () => {
    resetForm();
    setIsEdit(false);
    setIsDialogOpen(true);
  };
 
  /* ================= OPEN EDIT ================= */
 
  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setIsEdit(true);
 
    setFormData({
      title: course.title || "",
      description: course.description || "",
      level: course.level || "",
      language: course.language || "",
      category_id: course.category_id || "",
      status: course.status || "",
      schedule: course.schedule || "",
      image: null,
    });
 
    setIsDialogOpen(true);
  };
 
  /* ================= SUBMIT (POST / PUT) ================= */
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (!token) {
      toast.error("No token found");
      return;
    }
 
    try {
      setLoading(true);
 
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("level", formData.level);
      form.append("language", formData.language);
      form.append("category_id", formData.category_id);
      form.append("status", formData.status);
      form.append("schedule", formData.schedule);
 
      if (formData.image) {
        form.append("image", formData.image);
      }
 
      const url = isEdit
        ? `${API_BASE}/${selectedCourse.id}`
        : API_BASE;
 
      const method = isEdit ? "PUT" : "POST";
 
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
 
      if (!res.ok) throw new Error();
 
      toast.success(
        isEdit ? "Course updated successfully" : "Course added successfully"
      );
 
      setIsDialogOpen(false);
      fetchCourses();
      resetForm();
    } catch {
      toast.error(isEdit ? "Update failed" : "Create failed");
    } finally {
      setLoading(false);
    }
  };
 
 
 
  /* ================= DELETE ================= */

/* ================= DELETE ================= */

const handleDelete = async (id) => {
  if (!token) {
    toast.error("Unauthorized. Please login again.");
    return;
  }

  if (!id) {
    toast.error("Invalid Course ID");
    return;
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to delete course ID ${id}?`
  );

  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.msg || "Delete failed");
    }

    // Remove from UI immediately
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== id)
    );

    toast.success(data?.msg || "Course deleted successfully");
  } catch (error) {
    toast.error(error.message || "Something went wrong");
  }
};

  /* ================= FILTER ================= */
 
  /* ================= FILTER ================= */
 
const filteredCourses = courses.filter((course) => {
  const search = searchTerm.trim().toLowerCase();
 
  if (!search) return true;
 
  return (
    course.id?.toString().includes(search) ||
    course.title?.toLowerCase().includes(search)
  );
});
 
 
 
  /* ================= UI ================= */
 
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden px-3 sm:px-6">
 
  {/* HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
      Courses Management
    </h1>
 
    <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
      <Plus className="w-4 h-4 mr-2" />
      Add Course
    </Button>
  </div>
 
  {/* SEARCH */}
  <Input
    placeholder="Search..."
    className="w-full"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
 
  {/* TABLE CARD */}
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">All Courses</CardTitle>
    </CardHeader>
 
    <CardContent className="p-0 sm:p-4">
      {loading && <p className="p-4">Loading...</p>}
 
      <div className="w-full overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100 text-xs sm:text-sm">
              <th className="p-2">ID</th>
              <th className="p-2">Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Level</th>
              <th className="p-2">Language</th>
              <th className="p-2">Category</th>
              <th className="p-2">Status</th>
              <th className="p-2">Schedule</th>
              <th className="p-2">Instructor</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
 
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id} className="border-b text-center text-xs sm:text-sm">
                <td className="p-2">{course.id}</td>
 
                {/* IMAGE */}
                <td className="p-2">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded mx-auto"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
 
                <td className="p-2 max-w-[150px] truncate">
                  {course.title}
                </td>
 
                <td className="p-2 max-w-[200px] truncate">
                  {course.description}
                </td>
 
                <td className="p-2">{course.level}</td>
                <td className="p-2">{course.language}</td>
                <td className="p-2">{course.category_id}</td>
                <td className="p-2">{course.status}</td>
                <td className="p-2">{course.schedule}</td>
                <td className="p-2">{course.instructor_id}</td>
 
                {/* ACTIONS */}
                <td className="p-2">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleOpenEdit(course)}
                    >
                      Edit
                    </Button>
 
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
 
        {!loading && courses.length === 0 && (
          <p className="text-center py-6">No courses found</p>
        )}
      </div>
    </CardContent>
  </Card>
 
  {/* DIALOG */}
  <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
    <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Edit Course" : "Add Course"}
        </DialogTitle>
      </DialogHeader>
 
      <form onSubmit={handleSubmit} className="space-y-5">
 
        {/* Title */}
        <div className="grid gap-2">
          <Label>Course Title</Label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
 
        {/* Description */}
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
 
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 
          <div className="grid gap-2">
            <Label>Level</Label>
            <Input
              name="level"
              value={formData.level}
              onChange={handleChange}
            />
          </div>
 
          <div className="grid gap-2">
            <Label>Language</Label>
            <Input
              name="language"
              value={formData.language}
              onChange={handleChange}
            />
          </div>
 
          <div className="grid gap-2">
            <Label>Category ID</Label>
            <Input
              type="number"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            />
          </div>
 
          <div className="grid gap-2">
            <Label>Status</Label>
            <Input
              name="status"
              value={formData.status}
              onChange={handleChange}
            />
          </div>
 
          <div className="grid gap-2 sm:col-span-2">
            <Label>Schedule</Label>
            <Input
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
            />
          </div>
 
          <div className="grid gap-2 sm:col-span-2">
            <Label>Upload Image</Label>
            <Input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
 
        </div>
 
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Saving..."
            : isEdit
            ? "Update Course"
            : "Create Course"}
        </Button>
 
      </form>
    </DialogContent>
  </Dialog>
</div>
 
  );
};
 
export default Courses;
 
