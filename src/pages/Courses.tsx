import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, Edit, Eye, Upload } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'https://lauratek.in:8000/trainer/courses';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    language: '',
    category_id: 0,
    image: '',
    status: '',
    schedule: '',
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast.error('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '',
      language: '',
      category_id: 0,
      image: '',
      status: '',
      schedule: '',
    });
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course) => {
    setIsEdit(true);
    setSelectedCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      level: course.level || '',
      language: course.language || '',
      category_id: course.category_id || 0,
      image: course.image || '',
      status: course.status || '',
      schedule: course.schedule || '',
    });
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    if (!isEdit) {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('No access token found');
      return;
    }

    try {
      setLoading(true);
      const url = isEdit
        ? `${API_BASE}/${selectedCourse.id}`
        : API_BASE;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'add'} course`);
      }

      toast.success(isEdit ? 'Course updated successfully' : 'Course added successfully');
      handleClose();
      fetchCourses();
    } catch (error) {
      toast.error(`Error ${isEdit ? 'updating' : 'adding'} course`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!token) {
      toast.error('No access token found');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      toast.error('Error deleting course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Courses Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Multiple Courses
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by Course ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Course ID</th>
                  <th className="text-left py-3 px-4">Course Title</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Language</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{course.id}</td>
                    <td className="py-3 px-4">{course.title}</td>
                    <td className="py-3 px-4">{course.level}</td>
                    <td className="py-3 px-4">{course.language}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success('Viewing curriculum')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Curriculum
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success('Viewing materials')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Materials
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success('Upload dialog opened')}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(course)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p className="text-center py-4">Loading...</p>}
          {!loading && filteredCourses.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No courses found.</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md z-[60]">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Course' : 'Add Course'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the course details below.' : 'Enter the course details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category ID</Label>
                <Input
                  id="category_id"
                  name="category_id"
                  type="number"
                  value={formData.category_id}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;