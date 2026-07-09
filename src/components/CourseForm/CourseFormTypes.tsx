export type Category = {
  id: number;
  name: string;
};

export type CourseFormData = {
  title: string;
  description: string;
  level: string;
  language: string;
  category_id: string;
  status: string;
  startDate: string;
  duration: string;
  image: File | null;
};
