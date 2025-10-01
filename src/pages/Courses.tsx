import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Edit, Eye, Upload } from 'lucide-react';
import { mockCourses } from '@/data/mockData';
import { toast } from 'sonner';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses] = useState(mockCourses);

  const filteredCourses = courses.filter(course =>
    course.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Courses Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2">
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
              placeholder="Search by Course ID or Name..."
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
                  <th className="text-left py-3 px-4">Course Name</th>
                  <th className="text-left py-3 px-4">Students</th>
                  <th className="text-left py-3 px-4">Materials</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{course.id}</td>
                    <td className="py-3 px-4">{course.name}</td>
                    <td className="py-3 px-4">{course.students}</td>
                    <td className="py-3 px-4">{course.materials}</td>
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
                          onClick={() => toast.info('Edit mode activated')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => toast.error('Course deleted')}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Courses;
