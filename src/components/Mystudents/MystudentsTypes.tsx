export interface Student {
  id: number;
  name: string;
  email?: string;
  status?: "Active" | "Inactive";
  category?: "Frontend" | "Backend" | "Programming";
  performance?: number;
  exams?: number;
  passRate?: number;
  lastActive?: string;
  initials?: string;
  avatarColor?: string;
  phone?: string;
  address?: string;
}
