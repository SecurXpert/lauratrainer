import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL } from './services/api/api';
import { Exam } from '../components/Exams/ExamsTypes';
import ExamsHeader from '../components/Exams/ExamsHeader';
import ExamsStats from '../components/Exams/ExamsStats';
import ExamsFilters from '../components/Exams/ExamsFilters';
import ExamsList from '../components/Exams/ExamsList';

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [fetching, setFetching] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const fetchExams = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login to view exams');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/exam/get`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch exams');
      }

      const data = await response.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not load exams');
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (examId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" (ID: ${examId})?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No access token found.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/exam/delete?exam_id=${examId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Delete failed');
      }

      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not delete exam');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Calculate stats
  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.is_active === 1).length;
  const upcomingExams = exams.filter((e) => new Date(e.window_start) > new Date()).length;

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.id.toString().includes(searchQuery);
    const matchesCourse =
      selectedCourse === 'All Courses' || exam.collage === selectedCourse;
    const matchesStatus =
      selectedStatus === 'All Status' ||
      (selectedStatus === 'Active' && exam.is_active === 1) ||
      (selectedStatus === 'Inactive' && exam.is_active === 0);
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Get unique courses for dropdown
  const courses = ['All Courses', ...Array.from(new Set(exams.map((e) => e.collage)))];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full space-y-6">
        <ExamsHeader fetching={fetching} fetchExams={fetchExams} />

        <ExamsStats 
          totalExams={totalExams} 
          activeExams={activeExams} 
          upcomingExams={upcomingExams} 
        />

        <ExamsFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          courses={courses}
        />

        <ExamsList 
          fetching={fetching}
          filteredExams={filteredExams}
          examsLength={exams.length}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default Exams;