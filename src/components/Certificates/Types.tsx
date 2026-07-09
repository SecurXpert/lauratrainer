export interface Certificate {
  initials: string;
  name: string;
  studentId: string;
  courseId: string;
  certificateNo: string;
  date: string;
  status: string;
  download_url?: string;
}

export interface Course {
  id: number;
  name?: string;
  title?: string;
}
