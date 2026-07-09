import {
  LayoutDashboard,
  FileQuestion,
  Bell,
  Menu,
  LogOut,
  PlusSquare,
  Search,
  BarChart,
  Book,
  BookMarked,
  FilePlus,
  ClipboardPenLine,
  Video,
  Film,
  FileText,
  Users,
  Calendar,
  Medal,
  MessageSquare,
  FolderOpen
} from "lucide-react";
import { PiCertificateFill } from "react-icons/pi";

export const menuSections = [
  {
    title: "OVERVIEW",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/courses", label: "Courses", icon: Book },
      { path: "/curriculum", label: "Curriculum", icon: BookMarked },
    ],
  },
  {
    title: "Assessments",
    items: [
      { path: "/quizzes", label: "Quizzes", icon: FileQuestion },
      { path: "/quizzes/questions", label: "Question Bank", icon: FilePlus },
      { path: "/exam-management", label: "Coding Exam", icon: ClipboardPenLine },
    ],
  },
  {
    title: "Classes",
    items: [
      { path: "/classes", label: "Live Classes", icon: Video },
      { path: "/videos", label: "Recorded Videos", icon: Film },
      { path: "/resources", label: "Resources", icon: FileText },
      { path: "/coursematerials", label: "Course Materials", icon: FolderOpen },
    ],
  },
  {
    title: "Students",
    items: [
      { path: "/mystudents", label: "My Students", icon: Users },
      { path: "/attendance", label: "Attendance", icon: Calendar },
      { path: "/performance", label: "Performance Review", icon: BarChart },
    ],
  },
  {
    title: "More",
    items: [
      { path: "/badges", label: "Badges", icon: Medal },
      { path: "/certificates", label: "Certificates", icon: PiCertificateFill },
      { path: "/chat", label: "Chat", icon: MessageSquare },
      { path: "/analytics", label: "Analytics", icon: BarChart },
    ],
  },
];
