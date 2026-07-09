import axios from 'axios';
import { toast } from 'sonner';
import { AttendanceRecord } from './Types';
import { API_BASE_URL } from '@/pages/services/api/api';

const ADD_ENDPOINT = '/attendance/instructor/add';
const EDIT_ENDPOINT = '/attendance/instructor/edit';
const DELETE_ENDPOINT = '/attendance/instructor/delete';

export const useAttendanceMutations = (
  courseId: string,
  formData: any,
  formDate: string,
  formCheckIn: string,
  formCheckOut: string,
  editingRecord: AttendanceRecord | null,
  selectedStudent: any,
  fetchStudents: () => void,
  fetchAttendanceDetail: (id: number, name: string, preserve: boolean) => void,
  setShowAddForm: (v: boolean) => void,
  resetForm: () => void,
  setEditingRecord: (r: any) => void
) => {
  const token = localStorage.getItem('access_token');
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const getIsoString = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return undefined;
    try {
      const d = new Date(`${dateStr}T${timeStr}`);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch { return undefined; }
  };

  const handleAdd = async () => {
    if (!courseId) return toast.error('Please select a course from the dropdown first');
    if (!formData.student_id || !formDate || !formCheckIn) return toast.error('Required fields missing');
    const checkInIso = getIsoString(formDate, formCheckIn);
    const checkOutIso = formCheckOut ? getIsoString(formDate, formCheckOut) : undefined;
    if (!checkInIso) return toast.error('Invalid check-in date or time');

    try {
      await axiosInstance.post(ADD_ENDPOINT, {
        student_id: Number(formData.student_id), course_id: Number(courseId),
        check_in_time: checkInIso, check_out_time: checkOutIso,
      });
      toast.success('Added');
      setShowAddForm(false);
      resetForm();
      if (selectedStudent) fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name, true);
      else fetchStudents();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Add failed'); }
  };

  const handleEdit = async () => {
    if (!courseId) return toast.error('Please select a course from the dropdown first');
    if (!editingRecord || !formDate || !formCheckIn) return toast.error('Required fields missing');
    const checkInIso = getIsoString(formDate, formCheckIn);
    const checkOutIso = formCheckOut ? getIsoString(formDate, formCheckOut) : undefined;
    if (!checkInIso) return toast.error('Invalid check-in date or time');

    try {
      await axiosInstance.put(`${EDIT_ENDPOINT}/${editingRecord.id}`, {
        student_id: Number(formData.student_id || editingRecord.student_id), course_id: Number(courseId),
        check_in_time: checkInIso, check_out_time: checkOutIso,
      });
      toast.success('Updated');
      setEditingRecord(null);
      resetForm();
      if (selectedStudent) await fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name, true);
      await fetchStudents();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Update failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!id || id === 0) return toast.error('Cannot delete this record as it has no attendance ID.');
    if (!confirm('Delete this record?')) return;
    try {
      await axiosInstance.delete(`${DELETE_ENDPOINT}/${id}`);
      toast.success('Deleted');
      if (selectedStudent) await fetchAttendanceDetail(selectedStudent.student_id, selectedStudent.student_name, true);
      await fetchStudents();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Delete failed'); }
  };

  return { handleAdd, handleEdit, handleDelete };
};
