export interface Student {
  id: number;
  student_id: number;
  student_name: string;
  course: string;
  check_in_time: string;
  check_out_time: string;
  status: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  check_in: string;
  check_out: string | null;
  duration_hours: number | string;
  student_id: number;
  student_name: string;
  check_in_time?: string;
  check_out_time?: string;
  status?: string;
}
