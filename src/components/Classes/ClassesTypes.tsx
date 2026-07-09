export interface LiveClass {
  id: number;
  course_id: number;
  title: string;
  scheduled_at: string;
  duration: number;
  join_link: string;
  recorded_link?: string;
}
