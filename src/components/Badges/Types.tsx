export interface Course {
  id: number;
  name?: string;
  title?: string;
}

export interface Badge {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  icon_url?: string;
  rule?: any;
  additionalProp1?: any;
  is_active: boolean;
  created_at?: string;
}

export interface Student {
  id: number;
  name?: string;
  email?: string;
  username?: string;
}
