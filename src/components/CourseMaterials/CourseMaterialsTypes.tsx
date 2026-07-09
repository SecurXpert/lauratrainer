export interface Material {
  id: number;
  title: string;
  module_id?: string | null;
  file_url?: string;
  uploaded_by?: string;
  created_at?: string;
  course_title?: string;
  course_id?: number | string;
}

export interface MaterialFormData {
  courseId: string;
  title: string;
  moduleId: string;
  uploadedBy: string;
  file: File | null;
}
