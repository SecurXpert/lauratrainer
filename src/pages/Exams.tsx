import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  Edit,
  Search,
  FileText,
  CheckCircle,
  Timer,
  TrendingUp,
  ChevronDown,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface Exam {
  id: number;
  title: string;
  description: string;
  collage: string;
  window_start: string;
  window_end: string;
  duration: number;
  category: string;
  questions: Record<string, { question_bank_id: number; score: number }>;
  is_active: number;
}

const Exams = () => {
  const navigate = useNavigate();
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
        navigate('/login');
        return;
      }

      const response = await fetch('https://lauratek.in:8000/exam/get', {
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

      const response = await fetch(`https://lauratek.in:8000/exam/delete?exam_id=${examId}`, {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-7">
          <div>
            <h1 className="text-[30px] font-bold text-[#111827]">Exams</h1>
            <p className="text-[#64748B]">Create, manage and monitor all examinations</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchExams}
              variant="outline"
              disabled={fetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/exams/new')}
              className="h-10 px-5 rounded-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium shadow-[0_10px_22px_rgba(126,58,242,0.35)] flex"
            >
              <Plus className="h-4 w-4" />
              Create New Exam
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 mt-4">
          <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bfdbfe] rounded-full blur-[40px] opacity-100"></div>
            <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-[50px] h-[50px] rounded-[14px] bg-[#e7efff] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#2563eb]" strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                  +12%
                </span>
              </div>
              <div>
                <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
                  {totalExams}
                </h2>
                <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
                  Total Exams
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#bbf7d0] rounded-full blur-[40px] opacity-100"></div>
            <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-[50px] h-[50px] rounded-[14px] bg-[#def7ec] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#10b981]" strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                  +8%
                </span>
              </div>
              <div>
                <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
                  {activeExams}
                </h2>
                <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
                  Active Exams
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#fecaca] rounded-full blur-[40px] opacity-100"></div>
            <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-[50px] h-[50px] rounded-[14px] bg-[#fee2e2] flex items-center justify-center">
                  <Timer className="w-6 h-6 text-[#ef4444]" strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                  +5%
                </span>
              </div>
              <div>
                <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
                  {upcomingExams}
                </h2>
                <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
                  Upcoming Exams
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[22px] bg-[#ffffff] overflow-hidden h-[180px]">
            <div className="absolute -top-16 -right-16 w-[150px] h-[150px] bg-[#fde68a] rounded-full blur-[40px] opacity-100"></div>
            <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-[50px] h-[50px] rounded-[14px] bg-[#fef3c7] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#f59e0b]" strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-[#16A34A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                  +5%
                </span>
              </div>
              <div>
                <h2 className="text-[30px] leading-[1] font-bold tracking-[-1px] text-[#0f172a]">
                  78%
                </h2>
                <p className="mt-1 text-[14.5px] font-medium text-[#64748b]">
                  Average Score
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-200 mb-6 mt-6">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[14px]">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[18px]">Filters & Search</h3>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">Refine your exam list</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
            {/* Search - Flexible width */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by exam title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Right Side Group */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative flex-1 sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-600 appearance-none cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourse('All Courses');
                  setSelectedStatus('All Status');
                }}
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-600 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Exam List */}
        {fetching ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading exams...</div>
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No exams found</p>
              <p className="text-sm text-gray-400">
                {exams.length === 0
                  ? 'Create your first exam to get started'
                  : 'Try adjusting your search or filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="bg-white overflow-hidden rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-5 border-b">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{exam.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            exam.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {exam.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">ID: {exam.id}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="h-3 w-3 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">
                        {exam.collage} - {exam.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-5 py-3">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {exam.description || 'No description available for this exam.'}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="px-5 py-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Start Date</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(exam.window_start)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">End Date</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(exam.window_end)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Duration</p>
                          <p className="text-sm font-medium text-gray-700">{exam.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Questions</p>
                          <p className="text-sm font-medium text-gray-700">
                            {Object.keys(exam.questions).length} Questions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-4 flex gap-3">
                    <Button
                      onClick={() => navigate(`/exams/${exam.id}/edit`)}
                      className="flex-1 h-11 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(exam.id, exam.title)}
                      className="flex-1 h-11 gap-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-[0_4px_14px_0_rgb(0,0,0,0.05)] transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;