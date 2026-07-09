import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { API_BASE_URL } from "./services/api/api";
import { RecordedVideo } from "../components/Videos/VideosTypes";
import VideosHeader from "../components/Videos/VideosHeader";
import VideosStats from "../components/Videos/VideosStats";
import VideosUploadForm from "../components/Videos/VideosUploadForm";
import VideosFilters from "../components/Videos/VideosFilters";
import VideosGrid from "../components/Videos/VideosGrid";
import VideosPagination from "../components/Videos/VideosPagination";
import VideosEditDialog from "../components/Videos/VideosEditDialog";

const API_BASE = API_BASE_URL;
const TOKEN_KEY = 'access_token';

export default function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit Video State
  const [editVideo, setEditVideo] = useState<RecordedVideo | null>(null);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setCourseFilter('all');
  };

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
      const videoList = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setVideos(videoList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
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
        <VideosHeader setShowUploadForm={setShowUploadForm} />

        <VideosStats 
          videosCount={videos.length} 
          loading={loading} 
          displayStorage={displayStorage} 
        />

        {showUploadForm && (
          <VideosUploadForm 
            setShowUploadForm={setShowUploadForm}
            availableCourses={availableCourses}
            uniqueCourses={uniqueCourses}
            fetchVideos={fetchVideos}
          />
        )}

        <div className="space-y-6">
          <VideosFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            uniqueCourses={uniqueCourses}
            availableCourses={availableCourses}
            handleResetFilters={handleResetFilters}
          />

          <VideosGrid 
            loading={loading}
            filteredVideos={filteredVideos}
            paginatedVideos={paginatedVideos}
            availableCourses={availableCourses}
            setEditVideo={setEditVideo}
            setVideos={setVideos}
            videos={videos}
          />

          <VideosPagination 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredVideosLength={filteredVideos.length}
          />
        </div>

        {editVideo && (
          <VideosEditDialog 
            editVideo={editVideo}
            setEditVideo={setEditVideo}
            availableCourses={availableCourses}
            uniqueCourses={uniqueCourses}
            fetchVideos={fetchVideos}
          />
        )}
      </div>
    </div>
  );
}
