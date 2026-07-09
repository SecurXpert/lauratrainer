import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Play, Download, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { API_BASE_URL } from "../../pages/services/api/api";
import { RecordedVideo, formatDuration } from './VideosTypes';

interface VideosGridProps {
  loading: boolean;
  filteredVideos: RecordedVideo[];
  paginatedVideos: RecordedVideo[];
  availableCourses: any[];
  setEditVideo: (video: RecordedVideo) => void;
  setVideos: React.Dispatch<React.SetStateAction<RecordedVideo[]>>;
  videos: RecordedVideo[];
}

const API_BASE = API_BASE_URL;
const TOKEN_KEY = 'access_token';

const VideosGrid: React.FC<VideosGridProps> = ({
  loading, filteredVideos, paginatedVideos, availableCourses,
  setEditVideo, setVideos, videos
}) => {

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
          const videoList = Array.isArray(data) ? data : (data?.items || data?.data || []);
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


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No recorded videos found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {paginatedVideos.map((video) => {
        const course = availableCourses.find(c => String(c.id) === String(video.course_id));
        const courseName = course ? (course.title || course.name) : `Course #${video.course_id}`;

        return (
          <Card key={video.id} className="rounded-[20px] bg-white border border-gray-100 shadow-sm overflow-hidden p-0 relative group">
            {/* Floating Edit Button */}
            <button
              onClick={() => setEditVideo(video)}
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
  );
};

export default VideosGrid;
