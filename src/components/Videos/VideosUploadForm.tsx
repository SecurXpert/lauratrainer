import React, { useState, useEffect } from 'react';
import { Upload, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalDateString } from './VideosTypes';
import { API_BASE_URL } from "../../pages/services/api/api";

interface VideosUploadFormProps {
  setShowUploadForm: (val: boolean) => void;
  availableCourses: any[];
  uniqueCourses: (number | string)[];
  fetchVideos: () => void;
}

const API_BASE = API_BASE_URL;
const TOKEN_KEY = 'access_token';

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

const VideosUploadForm: React.FC<VideosUploadFormProps> = ({
  setShowUploadForm, availableCourses, uniqueCourses, fetchVideos
}) => {
  const todayStr = getLocalDateString();
  const [courseId, setCourseId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [title, setTitle] = useState('');
  const [recordedDate, setRecordedDate] = useState(todayStr);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
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
  }, []);

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

  return (
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
                      const courseTitle = course.title || course.name || `Course #${course.id}`;
                      const displayTitle = courseTitle.length > 25 ? courseTitle.substring(0, 25) + "..." : courseTitle;
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
  );
};

export default VideosUploadForm;
