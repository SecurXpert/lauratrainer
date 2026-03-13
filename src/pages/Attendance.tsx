import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GraduationCap, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
 
interface Student {
  id: number;
  student_id: number;
  student_name: string;
}
 
interface AttendanceRecord {
  id: number;
  date: string;
  check_in: string;
  check_out: string | null;
  duration_hours: number | string;
  student_id: number;
  student_name: string;
  check_in_time?: string;
  check_out_time?: string;
}
 
const API_BASE = 'http://192.168.0.122:10000';
const VIEW_ENDPOINT = '/attendance/instructor/view-attendance';
const ADD_ENDPOINT = '/attendance/instructor/add';
const EDIT_ENDPOINT = '/attendance/instructor/edit';
const DELETE_ENDPOINT = '/attendance/instructor/delete';
 
const Attendance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id') || '1';
 
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
 
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
 
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
 
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: courseId,
    check_in_time: '',
    check_out_time: '',
  });
 
  const token = localStorage.getItem('access_token');
 
  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
 
  const fetchStudents = async () => {
    if (!token) {
      toast.error('No token found. Please login.');
      navigate('/login');
      return;
    }
 
    setLoading(true);
    try {
      const res = await axiosInstance.get(VIEW_ENDPOINT, { params: { course_id: courseId } });
      const data = res.data || [];
 
      const studentMap = new Map<number, Student>();
      data.forEach((r: any) => {
        const sid = r.student_id;
        if (sid && !studentMap.has(sid)) {
          studentMap.set(sid, {
            id: sid,
            student_id: sid,
            student_name: r.student_name || 'Unknown',
          });
        }
      });
 
      setStudents(Array.from(studentMap.values()));
    } catch (err: any) {
      console.error('Fetch students failed:', err.response?.data || err.message);
      toast.error('Failed to load students');
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
 
  const fetchAttendanceDetail = async (studentId: number, studentName: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(VIEW_ENDPOINT, { params: { course_id: courseId } });
      const records = (res.data || [])
        .filter((r: any) => r.student_id === studentId)
        .map((r: any) => ({
          id: r.id,
          student_id: r.student_id,
          student_name: r.student_name || studentName,
          date: new Date(r.attended_at || r.check_in_time || '').toLocaleDateString('en-GB'),
          check_in: r.check_in_time
            ? new Date(r.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase()
            : '-',
          check_out: r.check_out_time
            ? new Date(r.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase()
            : '-',
          duration_hours: r.duration_hours != null ? Number(r.duration_hours).toFixed(2).replace(/\.?0+$/, '') : '0',
          check_in_time: r.check_in_time || '',
          check_out_time: r.check_out_time || '',
        }));
 
      setAttendanceRecords(records);
      setSelectedStudent({ id: studentId, student_id: studentId, student_name: studentName });
      setViewMode('detail');
    } catch (err: any) {
      toast.error('Failed to load details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleAdd = async () => {
    if (!formData.student_id || !formData.check_in_time) return toast.error('Required fields missing');
 
    try {
      await axiosInstance.post(ADD_ENDPOINT, {
        student_id: Number(formData.student_id),
        course_id: Number(courseId),
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time || undefined,
      });
      toast.success('Added');
      setShowAddForm(false);
      resetForm();
      if (selectedStudent) fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name);
    } catch (err: any) {
      console.error('Add failed:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Add failed');
    }
  };
 
  const handleEdit = async () => {
    if (!editingRecord || !formData.check_in_time) return toast.error('Required fields missing');
 
    try {
      await axiosInstance.put(`${EDIT_ENDPOINT}/${editingRecord.id}`, {
        student_id: Number(formData.student_id || editingRecord.student_id),
        course_id: Number(courseId),
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time || undefined,
      });
      toast.success('Updated');
      setEditingRecord(null);
      resetForm();
      if (selectedStudent) fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name);
    } catch (err: any) {
      console.error('Edit failed:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };
 
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this record?')) return;
 
    try {
      await axiosInstance.delete(`${DELETE_ENDPOINT}/${id}`);
      toast.success('Deleted');
      if (selectedStudent) fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name);
    } catch (err: any) {
      console.error('Delete failed:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };
 
  const startEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id.toString(),
      course_id: courseId,
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
    });
    setShowAddForm(true); // reuse the same form
  };
 
  const resetForm = () => {
    setFormData({
      student_id: '',
      course_id: courseId,
      check_in_time: '',
      check_out_time: '',
    });
    setShowAddForm(false);
    setEditingRecord(null);
  };
 
  useEffect(() => {
    fetchStudents();
  }, [courseId]);
 
  const handleBack = () => {
    setViewMode('list');
    setSelectedStudent(null);
    setAttendanceRecords([]);
    resetForm();
  };
 
  if (!token) {
    return <div className="min-h-screen flex items-center justify-center p-4">Please login first</div>;
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Student Attendance</h1>
          </div>
 
          {viewMode === 'detail' && (
            <Button onClick={() => { resetForm(); setShowAddForm(true); }} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus size={16} /> Add Attendance
            </Button>
          )}
        </div>
 
        {(showAddForm || editingRecord) && (
          <Card className="mb-8 shadow">
            <CardHeader>
              <CardTitle>{editingRecord ? 'Edit Attendance' : 'Add Attendance'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <Input
                  value={formData.student_id}
                  onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                  disabled={!!editingRecord}
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-in Time (ISO)</label>
                <Input
                  type="datetime-local"
                  value={formData.check_in_time}
                  onChange={e => setFormData({ ...formData, check_in_time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out Time (optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.check_out_time}
                  onChange={e => setFormData({ ...formData, check_out_time: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={editingRecord ? handleEdit : handleAdd}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Saving...' : editingRecord ? 'Update' : 'Add'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
 
        {viewMode === 'list' && (
          <Card>
            <CardHeader><CardTitle>Students List</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-center py-10">Loading...</p> : students.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No students found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(s => (
                        <TableRow key={s.student_id}>
                          <TableCell>{s.student_id}</TableCell>
                          <TableCell className="font-medium">{s.student_name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => fetchAttendanceDetail(s.student_id, s.student_name)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
 
        {viewMode === 'detail' && selectedStudent && (
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle>Attendance Sheet - {selectedStudent.student_name}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-10">Loading...</p>
              ) : attendanceRecords.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No records</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Duration (hrs)</TableHead>
                        <TableHead className="text-right w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map(r => (
                        <TableRow key={r.id}>
                          <TableCell>{r.id}</TableCell>
                          <TableCell>{r.date}</TableCell>
                          <TableCell>{r.check_in}</TableCell>
                          <TableCell>{r.check_out}</TableCell>
                          <TableCell>{r.duration_hours}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(r)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
 
export default Attendance;
 
 
 
 
 
 
 