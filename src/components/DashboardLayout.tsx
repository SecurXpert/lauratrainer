import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileQuestion,
  Video,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  LogOut,
  User,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileModal from './ProfileModal';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/quizzes', label: 'Quizzes', icon: FileQuestion },
    { path: '/classes', label: 'Classes', icon: Video },
    { path: '/exams', label: 'Exams', icon: FileText },
    { path: '/interviews', label: 'Interviews', icon: Users },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/chat', label: 'Chat', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 z-40",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <span className="font-bold text-lg">Instructor</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 transition-all duration-300", isSidebarOpen ? "ml-64" : "ml-20")}>
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30 shadow-soft">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {user?.name}!</h2>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsProfileOpen(true)}
                className="rounded-full"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
