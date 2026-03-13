 
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
import { Upload, Video, RefreshCw, Loader2, Calendar, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
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
}
 
const API_BASE = 'http://192.168.0.122:10000/trainer';
const TOKEN_KEY = 'access_token';
 
export default function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
 
  // POST form fields
  const [courseId, setCourseId] = useState('1');
  const [title, setTitle] = useState('');
  const [recordedDate, setRecordedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
 
  // PUT (edit) fields
  const [editVideo, setEditVideo] = useState<RecordedVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
 
  // DELETE confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }
 
      const res = await fetch(`${API_BASE}/recorded-videos`, {
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
      setVideos(data || []);
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
 
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
 
    setUploading(true);
 
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');
 
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('title', title.trim());
      formData.append('recorded_date', recordedDate);
      formData.append('video_file', videoFile);
 
      const res = await fetch(`${API_BASE}/recorded-videos`, {
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
 
  // Open edit dialog
  const handleEditClick = (video: RecordedVideo) => {
    setEditVideo(video);
    setEditTitle(video.title);
    setEditCourseId(String(video.course_id));
    setEditDialogOpen(true);
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
      formData.append('title', editTitle.trim());
      // Note: recorded_date is NOT sent (as per your screenshot)
 
      const res = await fetch(`${API_BASE}/recorded-videos/${editVideo.id}`, {
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
 
  // Delete video
  const handleDelete = async () => {
    if (!deleteId) return;
 
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');
 
      const res = await fetch(`${API_BASE}/recorded-videos/${deleteId}`, {
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
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete video');
    }
  };
 
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/login');
      return;
    }
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);
 
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recorded Videos</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your course lecture recordings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            variant={showUploadForm ? "default" : "outline"}
          >
            <Plus className="mr-2 h-4 w-4" />
            {showUploadForm ? "Hide Upload Form" : "Upload New Video"}
          </Button>
          <Button onClick={fetchVideos} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
 
      {/* ─── UPLOAD FORM ──────────────────────────────────────────────── */}
      {showUploadForm && (
        <Card className="mb-10 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Recording
            </CardTitle>
            <CardDescription>
              Select a video file and fill in the details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="course">Course ID</Label>
                  <Input
                    id="course"
                    placeholder="Enter course ID (e.g. 1, 45, HMS-2025)"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  />
                </div>
 
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. HMS - Google Chrome Session"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
 
                <div>
                  <Label htmlFor="date">Recorded Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={recordedDate}
                    onChange={(e) => setRecordedDate(e.target.value)}
                  />
                </div>
              </div>
 
              <div>
                <Label>Video File</Label>
                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                      <label className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="sr-only"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground mt-2">
                      MP4 or WebM up to 2GB
                    </p>
                    {videoFile && (
                      <p className="mt-2 text-sm font-medium text-primary truncate max-w-xs mx-auto">
                        {videoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
 
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || !videoFile || !title.trim()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Video'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
 
      {/* ─── VIDEO LIST ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Your Recordings</h2>
 
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No recorded videos found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="line-clamp-2 leading-tight">
                      {video.title}
                    </CardTitle>
                    <Badge variant="outline">{video.course_id}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 mt-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(video.recorded_date), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1.5"
                    >
                      <BookOpen className="h-4 w-4" />
                      Watch on S3
                    </a>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t bg-muted/40">
                  <div className="truncate max-w-[60%]">
                    {video.url_key || video.video_url.split('/').pop()}
                  </div>
 
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(video)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
 
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteId(video.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
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
              <Input
                id="edit-course-id"
                value={editCourseId}
                onChange={(e) => setEditCourseId(e.target.value)}
                placeholder="Course ID"
              />
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
            <Button onClick={handleUpdate} disabled={!editTitle.trim() || !editCourseId.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
 
      {/* ─── DELETE CONFIRMATION ──────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The video recording will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
 