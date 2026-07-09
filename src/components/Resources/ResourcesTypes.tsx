export interface Course {
  id: number | string;
  title: string;
}

export interface Resource {
  id: number;
  course_id: string | number;
  title: string;
  file_type?: string;
  file_url?: string;
  external_url?: string;
  duration_seconds?: string;
  uploaded_at?: string;
  created_at?: string;
}

export const formatLocalDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return '';
  }
};
