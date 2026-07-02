import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Attendance from "./pages/Attendance";
import Quizzes from "./pages/Quizzes";
import Classes from "./pages/Classes";
import Videos from "./pages/Videos";
import Interviews from "./pages/Interviews";
import Exams from "./pages/Exams";
import Chat from "./pages/Chat";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
import Curriculum from "./pages/Curriculum";
import Mystudents from "./pages/Mystudents"; 
import Performancereview from "./pages/Performancereview"; 
import CourseMaterials from "./pages/CourseMaterials";
import Badges from "./pages/Badges";
import Codingquestions from "./pages/Codingquestions";
import Certificates from "./pages/Certificates";

const queryClient = new QueryClient();

/* ==========================
   PROTECTED ROUTE
========================== */

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <Routes>

              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Default redirect */}
                <Route index element={<Navigate to="dashboard" replace />} />

                <Route path="dashboard" element={<Dashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="classes" element={<Classes />} />
                <Route path="videos" element={<Videos />} />
                <Route path="interviews" element={<Interviews />} />
                <Route path="Exams" element={<Exams />} />
                <Route path="chat" element={<Chat />} />
                <Route path="resources" element={<Resources />} />
                <Route path="curriculum" element={<Curriculum />} /> 
                <Route path="mystudents" element={<Mystudents />} />
                <Route path="performance" element={<Performancereview />} /> 
                <Route path="coursematerials" element={<CourseMaterials />} /> 
                <Route path="badges" element={<Badges />} />
                <Route path="codingquestions" element={<Codingquestions />} />
               <Route path="Certificates" element={<Certificates />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;