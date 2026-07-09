import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCoursesAndStudents } from '@/components/Attendance/useCoursesAndStudents';
import { useAttendanceFetcher } from '@/components/Attendance/useAttendanceFetcher';
import { useAttendanceMutations } from '@/components/Attendance/useAttendanceMutations';
import { AttendanceHeader } from '@/components/Attendance/AttendanceHeader';
import { AttendanceList } from '@/components/Attendance/AttendanceList';
import { AttendanceForm } from '@/components/Attendance/AttendanceForm';
import { AttendanceDetail } from '@/components/Attendance/AttendanceDetail';
import { AttendanceRecord } from '@/components/Attendance/Types';

const Attendance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get('course_id') || '';

  const { courses, allStudents } = useCoursesAndStudents();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const {
    students, loading, attendanceRecords, setAttendanceRecords,
    selectedStudent, setSelectedStudent,
    viewMode, setViewMode,
    currentPage, setCurrentPage,
    fetchStudents, fetchAttendanceDetail
  } = useAttendanceFetcher(courseId, fromDate, toDate, courses);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [listPage, setListPage] = useState(1);

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: courseId,
    check_in_time: '',
    check_out_time: '',
  });

  const [formDate, setFormDate] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');

  const resetForm = () => {
    setFormData({ student_id: '', course_id: courseId, check_in_time: '', check_out_time: '' });
    setFormDate(''); setFormCheckIn(''); setFormCheckOut('');
    setShowAddForm(false); setEditingRecord(null);
  };

  const { handleAdd, handleEdit, handleDelete } = useAttendanceMutations(
    courseId, formData, formDate, formCheckIn, formCheckOut, editingRecord,
    selectedStudent, fetchStudents, fetchAttendanceDetail, setShowAddForm, resetForm, setEditingRecord
  );

  useEffect(() => { setListPage(1); }, [searchTerm, courseId]);

  const handleBack = () => {
    setViewMode('list'); setSelectedStudent(null);
    setAttendanceRecords([]); resetForm();
  };

  const handleResetFilters = () => {
    setSearchTerm(''); setFromDate(''); setToDate(''); setSearchParams({});
  };

  const getCalculatedDuration = () => {
    if (!formCheckIn || !formCheckOut) return '';
    const [inH, inM] = formCheckIn.split(':').map(Number);
    const [outH, outM] = formCheckOut.split(':').map(Number);
    let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMins < 0) return 'Invalid time range';
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  const handleExport = () => {
    if (attendanceRecords.length === 0) return toast.error('No records to export');
    const headers = ['Date', 'Check-in Time', 'Check-out Time', 'Duration (Hours)', 'Attendance ID'];
    const rows = attendanceRecords.map(r => [r.date, r.check_in, r.check_out, r.duration_hours, r.id]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedStudent?.student_name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const token = localStorage.getItem('access_token');
  if (!token) return <div className="min-h-screen flex items-center justify-center p-4">Please login first</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col w-full">
      <AttendanceHeader showAddForm={showAddForm} editingRecord={editingRecord} viewMode={viewMode} resetForm={resetForm} setShowAddForm={setShowAddForm} />
      
      <div className="w-full p-2 md:p-3 flex-1">
        {viewMode === 'list' && !showAddForm && !editingRecord && (
          <AttendanceList 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
            fromDate={fromDate} setFromDate={setFromDate} 
            toDate={toDate} setToDate={setToDate} 
            courseId={courseId} setSearchParams={setSearchParams} 
            courses={courses} handleResetFilters={handleResetFilters} 
            loading={loading} students={students} 
            listPage={listPage} setListPage={setListPage} 
            fetchAttendanceDetail={fetchAttendanceDetail} 
          />
        )}

        {(showAddForm || editingRecord) && (
          <AttendanceForm 
            editingRecord={editingRecord} resetForm={resetForm} courseId={courseId} setSearchParams={setSearchParams}
            courses={courses} formData={formData} setFormData={setFormData} allStudents={allStudents}
            formDate={formDate} setFormDate={setFormDate} formCheckIn={formCheckIn} setFormCheckIn={setFormCheckIn}
            formCheckOut={formCheckOut} setFormCheckOut={setFormCheckOut} durationText={getCalculatedDuration()}
            handleAdd={handleAdd} handleEdit={handleEdit} loading={loading}
          />
        )}

        {viewMode === 'detail' && selectedStudent && !showAddForm && !editingRecord && (
          <AttendanceDetail 
            handleBack={handleBack} handleExport={handleExport} loading={loading} 
            attendanceRecords={attendanceRecords} currentPage={currentPage} setCurrentPage={setCurrentPage} handleDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;