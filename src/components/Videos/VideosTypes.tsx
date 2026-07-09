export interface RecordedVideo {
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

export const formatDuration = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null) return "45:30";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export const formatSize = (mb?: number) => {
  if (!mb) return "125 MB";
  if (mb < 1024) {
    return `${mb.toFixed(0)} MB`;
  }
  return `${(mb / 1024).toFixed(1)} GB`;
};

export const getLocalDateString = (d: Date = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
