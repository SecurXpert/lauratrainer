
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, RefreshCw, Loader2, Calendar, BookOpen, Plus, Pencil, Trash2, Play, Download, Search, ChevronDown } from 'lucide-react';
import { BsFillCalendar2Fill } from "react-icons/bs";
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecordedVideo {
  id: number;
  course_id: number;
  title: string;
  recorded_date: string;       // ISO string
  video_url: string;
  url_key?: string;
  file_size_mb?: number;
  trainer_id?: number;
  duration_seconds?: number | null;
}

const API_BASE = 'https://lauratek.in:8000';
const TOKEN_KEY = 'access_token';

export default function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDuration = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null) return "45:30";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatSize = (mb?: number) => {
    if (!mb) return "125 MB";
    if (mb < 1024) {
      return `${mb.toFixed(0)} MB`;
    }
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // POST form fields
  const getLocalDateString = (d: Date = new Date()) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalDateString();

  const [courseId, setCourseId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [title, setTitle] = useState('');
  const [recordedDate, setRecordedDate] = useState(todayStr);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Date limits for upload - 1 week past and 1 week future
  const minDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  })();
  const maxDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return getLocalDateString(d);
  })();

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setCourseFilter('all');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > MAX_SIZE) {
        toast.error('File size exceeds the 2GB limit.');
        e.target.value = '';
        setVideoFile(null);
        return;
      }
      setVideoFile(file);
    } else {
      setVideoFile(null);
    }
  };

  // PUT (edit) fields
  const [editVideo, setEditVideo] = useState<RecordedVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editTrainerId, setEditTrainerId] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);



  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/admin/recorded-videos`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const videoList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
      setVideos(videoList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  // Upload new video (POST)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!courseId) {
      toast.error('Please select a course');
      return;
    }

    if (!trainerId) {
      toast.error('Please select a trainer');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (recordedDate < minDateStr || recordedDate > maxDateStr) {
      toast.error('Recorded date must be within 1 week in the past or 1 week in the future');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('course_id', courseId);
      if (trainerId) formData.append('trainer_id', trainerId);
      formData.append('title', title.trim());
      formData.append('recorded_date', recordedDate);
      formData.append('video_file', videoFile);

      const res = await fetch(`${API_BASE}/admin/upload-recorded-video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Upload failed (${res.status})`);
      }

      toast.success('Video uploaded successfully!');
      setTitle('');
      setCourseId('');
      setTrainerId('');
      setVideoFile(null);
      setRecordedDate(new Date().toISOString().split('T')[0]);
      setShowUploadForm(false);
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (video: any) => {
    setEditVideo(video);
    setEditTitle(video.title || '');
    setEditCourseId(String(video.course_id || ''));

    const rawTrainer = video.trainer_id ?? video.trainer ?? video.instructor_id ?? video.instructor ?? video.trainerId ?? video.trainer_id_id ?? '';
    let parsedTrainerId = '';
    if (rawTrainer && typeof rawTrainer === 'object') {
      parsedTrainerId = String(rawTrainer.id ?? rawTrainer.trainer_id ?? rawTrainer.instructor_id ?? '');
    } else {
      parsedTrainerId = String(rawTrainer);
    }

    if (!parsedTrainerId) {
      try {
        const cached = localStorage.getItem("trainer_profile");
        if (cached) {
          const profile = JSON.parse(cached);
          const tid = profile.id ?? profile.trainer_id ?? profile.instructor_id ?? profile.user_id ?? profile.userId ?? '';
          if (tid) {
            parsedTrainerId = String(tid);
          }
        }
      } catch (e) {
        console.error("Error reading trainer profile for edit fallback:", e);
      }
    }

    setEditTrainerId(parsedTrainerId);
    setEditDialogOpen(true);
  };

  const handlePlayInNewTab = (videoUrl: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Video Player</title>
            <style>
              body { margin: 0; background: black; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
              video { max-width: 100%; max-height: 100vh; outline: none; }
            </style>
          </head>
          <body>
            <video src="${videoUrl}" controls autoplay playsinline></video>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // Save updated video (PUT) — matched to screenshot (form-urlencoded style)
  const handleUpdate = async () => {
    if (!editVideo) return;
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');

      // Using URLSearchParams → sends as application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('course_id', editCourseId);
      if (editTrainerId) formData.append('trainer_id', editTrainerId);
      formData.append('title', editTitle.trim());
      // Note: recorded_date is NOT sent (as per your screenshot)

      const res = await fetch(`${API_BASE}/trainer/recorded-videos/${editVideo.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Update failed (${res.status})`);
      }

      toast.success('Video updated successfully');
      setEditDialogOpen(false);
      setEditVideo(null);
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update video');
    }
  };

  // Delete video directly and optimistically
  const handleDelete = async (id: number) => {
    const previousVideos = videos;
    setVideos(prev => prev.filter(v => v.id !== id));

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE}/trainer/recorded-videos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = `Delete failed (${res.status})`;
        try {
          const errData = await res.json();
          errorMessage = errData.message || errorMessage;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMessage);
      }

      toast.success('Video deleted successfully');
      // Silently refresh list in background
      try {
        const fetchRes = await fetch(`${API_BASE}/admin/recorded-videos`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          const videoList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
          setVideos(videoList);
        }
      } catch (err) {
        console.error("Background sync failed:", err);
      }
    } catch (err: any) {
      setVideos(previousVideos);
      console.error(err);
      toast.error(err.message || 'Failed to delete video');
    }
  };

  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/login');
      return;
    }
    fetchVideos();

    try {
      const cached = localStorage.getItem("trainer_profile");
      if (cached) {
        const profile = JSON.parse(cached);
        const tid = profile.id ?? profile.trainer_id ?? profile.instructor_id ?? profile.user_id ?? profile.userId ?? '';
        if (tid) {
          setTrainerId(String(tid));
        }
      }
    } catch (e) {
      console.error("Error reading trainer profile for upload default:", e);
    }

    const fetchDropdownData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const coursesRes = await fetch(`${API_BASE}/trainer/courses`, { headers });

        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          setAvailableCourses(Array.isArray(cData) ? cData : []);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown options", err);
      }
    };
    fetchDropdownData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Unique courses and trainers from videos (as fallback)
  const uniqueCourses = Array.isArray(videos) 
    ? Array.from(new Set(videos.map(v => v?.course_id).filter(id => id !== undefined && id !== null))) 
    : [];
  const uniqueTrainers = Array.isArray(videos) 
    ? Array.from(new Set(videos.map(v => v?.trainer_id).filter(Boolean))) 
    : [];

  // Filter videos
  const filteredVideos = Array.isArray(videos) ? videos.filter((video) => {
    if (!video) return false;
    const matchesSearch = (video.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.course_id !== undefined && video.course_id !== null && video.course_id.toString().includes(searchTerm));
    const matchesDate = !dateFilter || (video.recorded_date && video.recorded_date.startsWith(dateFilter));
    const matchesCourse = courseFilter === 'all' || (video.course_id !== undefined && video.course_id !== null && video.course_id.toString() === courseFilter);
    return matchesSearch && matchesDate && matchesCourse;
  }) : [];

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, courseFilter, Array.isArray(videos) ? videos.length : 0]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Storage calculation
  const totalStorageMB = Array.isArray(videos) ? videos.reduce((sum, video) => sum + (video?.file_size_mb || 0), 0) : 0;
  let displayStorage = '24.5 GB'; // fallback if 0
  if (totalStorageMB > 0) {
    if (totalStorageMB < 1024) {
      displayStorage = `${totalStorageMB.toFixed(1)} MB`;
    } else {
      displayStorage = `${(totalStorageMB / 1024).toFixed(2)} GB`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full">
        <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-5 sm:mb-7 border-b border-gray-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold">Recorded Videos</h1>
            <p className="text-[#64748B]">
              Manage your course video library
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload New Video
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-[20px] p-6 shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
            <p className="text-[14.5px] font-medium text-[#6A7282] mb-1.5">Total Videos</p>
            {loading ? (
              <div className="h-[30px] w-16 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-[30px] font-extrabold text-[#101828] leading-none tracking-tight">{videos.length}</p>
            )}
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
            <p className="text-[14.5px] font-medium text-[#6A7282] mb-1.5">Storage Used</p>
            {loading ? (
              <div className="h-[30px] w-24 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-[30px] font-extrabold text-[#00A63E] leading-none tracking-tight">{displayStorage}</p>
            )}
          </div>
        </div>

        {/* ─── UPLOAD MODAL ──────────────────────────────────────────────── */}
        {showUploadForm && (
          <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-end justify-center p-4 pb-10 sm:items-center sm:p-4 sm:py-8">
              <div
                className="flex min-h-0 w-full max-w-[360px] flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl max-h-[calc(100dvh-4rem)] sm:max-h-[min(90dvh,44rem)]"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
                  <h2 className="min-w-0 text-base font-bold text-blue-600 sm:text-lg">
                    Add Video
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="shrink-0 text-gray-800 hover:text-black transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 no-scrollbar">
                  <form onSubmit={handleUpload} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-gray-800">
                        Course ID
                      </label>
                      <div className="relative">
                        <select
                          value={courseId}
                          onChange={(e) => setCourseId(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 text-sm appearance-none cursor-pointer bg-[#F9FAFB]"
                          required
                        >
                          <option value="" disabled>Select Course</option>
                          {availableCourses.length > 0 ? availableCourses.map(course => {
                            const title = course.title || course.name || `Course #${course.id}`;
                            const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                            return (
                              <option key={course.id} value={course.id}>
                                {displayTitle} (ID: {course.id})
                              </option>
                            );
                          }) : uniqueCourses.map(id => (
                            <option key={id} value={id}>Course ID: {id}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                          <ChevronDown className="h-4 w-4 text-gray-500 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-gray-800">
                        Trainer ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Trainer ID"
                        value={trainerId}
                        onChange={(e) => setTrainerId(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 text-sm placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-gray-800">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Title"
                        value={title}
                        maxLength={25}
                        onChange={(e) => setTitle(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 text-sm placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-gray-800">
                        Upload Date
                      </label>
                      <input
                        type="date"
                        value={recordedDate}
                        min={minDateStr}
                        max={maxDateStr}
                        onChange={(e) => setRecordedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 text-sm text-gray-700"
                      />
                    </div>

                    <div className="pt-2">
                      <div className="relative mt-1 flex flex-col items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-gray-300 bg-white px-6 py-5 transition-colors hover:bg-gray-50 cursor-pointer">
                        <Upload className="mx-auto h-6 w-6 text-[#8e98a8] mb-1.5 stroke-[2.5]" />
                        <div className="flex text-[13.5px] leading-6 text-[#475467] font-medium">
                          <label className="relative cursor-pointer focus-within:outline-none">
                            <span>Drag and drop or click to upload</span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-[11.5px] font-medium text-[#98A2B3] mt-0.5">
                          MP4 or WebM (max. 2GB)
                        </p>
                        {videoFile && (
                          <p className="mt-2 text-[12.5px] font-medium text-[#6366f1] truncate max-w-[90%] px-4 bg-indigo-50/50 py-1 rounded-full border border-indigo-100">
                            {videoFile.name}
                          </p>
                        )}
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                          title=""
                        />
                      </div>
                    </div>

                    <div className="pt-4 pb-2">
                      <button
                        type="submit"
                        disabled={uploading || !videoFile || !title.trim()}
                        className="w-full py-3.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIDEO LIST ───────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="bg-white rounded-[16px] p-4 sm:p-5 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-y-4 gap-x-4 items-center">
              {/* Search */}
              <div className="relative w-full lg:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  maxLength={30}
                  onChange={(e) => setSearchTerm(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium placeholder:text-gray-400"
                />
              </div>

              {/* Right Side Group */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[140px] sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                  />
                  <BsFillCalendar2Fill className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative flex-1 min-w-[140px] sm:flex-none w-full sm:w-40 md:w-48 lg:w-40 xl:w-48">
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] focus:outline-none focus:ring-0 focus:border-gray-200 focus:bg-white transition-colors text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="all">All Courses</option>
                    {uniqueCourses.map(id => {
                      const course = availableCourses.find(c => Number(c.id) === Number(id));
                      const title = course?.title || course?.name || `Course #${id}`;
                      const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                      return (
                        <option key={id} value={id.toString()}>
                          {displayTitle} (ID: {id})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 rounded-xl bg-[#F9FAFB] hover:bg-gray-50 text-gray-500 text-sm font-bold transition-all whitespace-nowrap min-w-[130px] w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No recorded videos found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {paginatedVideos.map((video) => {
                const course = availableCourses.find(c => String(c.id) === String(video.course_id));
                const courseName = course ? (course.title || course.name) : `Course #${video.course_id}`;
                const views = (video as any).views ?? ((video.id * 23) % 400 + 50);

                return (
                  <Card key={video.id} className="rounded-[20px] bg-white border border-gray-100 shadow-sm overflow-hidden p-0 relative group">
                    {/* Floating Edit Button */}
                    <button
                      onClick={() => handleEditClick(video)}
                      className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/95 hover:bg-white text-[#4f46e5] hover:text-[#3b32c6] rounded-xl flex items-center justify-center transition-all shadow-md border border-gray-100 hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Edit Video"
                    >
                      <Pencil className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div
                      onClick={() => handlePlayInNewTab(video.video_url)}
                      className="overflow-hidden relative aspect-[16/9] bg-slate-900 group-hover:shadow-md transition-shadow block cursor-pointer"
                    >
                      {/* Actual video used as thumbnail */}
                      <video
                        src={video.video_url}
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                        preload="metadata"
                        muted
                        playsInline
                      />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Play className="w-7 h-7 text-[#4f46e5] fill-[#4f46e5] ml-1.5" />
                        </div>
                      </div>

                      {/* Duration Overlay Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/85 text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                        {formatDuration(video.duration_seconds)}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1" title={video.title}>
                        {video.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 font-medium mt-1">
                        {courseName}
                      </p>

                      {/* Stats Row */}
                      <div className="bg-[#F9FAFB] border border-[#E2E8F0]/60 rounded-xl p-3.5 mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</span>
                          <span className="block text-sm font-bold text-slate-700 mt-1">{formatDuration(video.duration_seconds)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#6b4cfa] to-[#8862fa] hover:from-[#5a3ae3] hover:to-[#764ded] text-white py-2.5 rounded-[12px] font-semibold text-[14px] transition-colors shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="flex items-center justify-center gap-2 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#E70008] py-2.5 rounded-[12px] font-semibold text-[14px] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>

                      {/* Footer */}
                      <p className="mt-5 mb-1 text-[12px] text-gray-400 font-medium">
                        Uploaded on {video.recorded_date ? (() => {
                          const d = new Date(video.recorded_date);
                          return isNaN(d.getTime()) ? "N/A" : format(d, 'yyyy-MM-dd');
                        })() : "N/A"}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredVideos.length)}
                </span>{' '}
                of <span className="font-medium">{filteredVideos.length}</span> videos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ─── EDIT DIALOG ──────────────────────────────────────────────── */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Video Metadata</DialogTitle>
              <DialogDescription>
                Update title and course ID. Video file and date cannot be changed here.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-course-id">Course ID</Label>
                <select
                  id="edit-course-id"
                  value={editCourseId}
                  onChange={(e) => setEditCourseId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Course</option>
                  {availableCourses.length > 0 ? availableCourses.map(course => {
                    const title = course.title || course.name || `Course #${course.id}`;
                    const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                    return (
                      <option key={course.id} value={course.id}>
                        {displayTitle} (ID: {course.id})
                      </option>
                    );
                  }) : uniqueCourses.map(id => (
                    <option key={id} value={id}>Course ID: {id}</option>
                  ))}
                </select>
              </div>


              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Video title"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!editTitle.trim() || !editCourseId.trim()} className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white border-0">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}
