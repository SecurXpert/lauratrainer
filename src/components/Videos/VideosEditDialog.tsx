import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API_BASE_URL } from "../../pages/services/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RecordedVideo } from './VideosTypes';

interface VideosEditDialogProps {
  editVideo: RecordedVideo | null;
  setEditVideo: (val: RecordedVideo | null) => void;
  availableCourses: any[];
  uniqueCourses: (string | number)[];
  fetchVideos: () => void;
}

const API_BASE = API_BASE_URL;
const TOKEN_KEY = 'access_token';

const VideosEditDialog: React.FC<VideosEditDialogProps> = ({
  editVideo, setEditVideo, availableCourses, uniqueCourses, fetchVideos
}) => {
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editTrainerId, setEditTrainerId] = useState('');

  useEffect(() => {
    if (editVideo) {
      setEditTitle(editVideo.title || '');
      setEditCourseId(String(editVideo.course_id || ''));
  
      const rawTrainer = editVideo.trainer_id ?? (editVideo as any).trainer ?? (editVideo as any).instructor_id ?? (editVideo as any).instructor ?? (editVideo as any).trainerId ?? (editVideo as any).trainer_id_id ?? '';
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
    }
  }, [editVideo]);

  const handleUpdate = async () => {
    if (!editVideo) return;
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');

      const formData = new URLSearchParams();
      formData.append('course_id', editCourseId);
      if (editTrainerId) formData.append('trainer_id', editTrainerId);
      formData.append('title', editTitle.trim());

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
      setEditVideo(null);
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update video');
    }
  };

  return (
    <Dialog open={!!editVideo} onOpenChange={(open) => !open && setEditVideo(null)}>
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
          <Button variant="outline" onClick={() => setEditVideo(null)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!editTitle.trim() || !editCourseId.trim()} className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white border-0">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideosEditDialog;
