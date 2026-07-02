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
import CodingQuestions from "./pages/CodingQuestions";
import Certificates from "./pages/Certificates";
import Analytics from "./pages/Analytics";

// Additional Pages
import CreateQuiz from "./pages/CreateQuiz";
import BulkUpload from "./pages/BulkUpload";
import AddQuestion from "./pages/AddQuestion";
import AddQuestionPage from "./pages/AddQuestionPage";
import CourseForm from "./pages/CourseForm";
import CurriculumForm from "./pages/CurriculumForm";
import ExamForm from "./pages/ExamForm";
import ExamManagement from "./pages/ExamManagement";
import AddExamQuestion from "./pages/AddExamQuestion";
import CreateExamPage from "./pages/CreateExamPage";
import ViewQuestionDetails from "./pages/ViewQuestionDetails";
import ViewExamDetails from "./pages/ViewExamDetails";
import Settings from "./pages/Settings";
import ViewQuizDetails from "./pages/ViewQuizDetails";
import EditQuiz from "./pages/EditQuiz";

const queryClient = new QueryClient();

/* ==========================
   PROTECTED ROUTE
========================== */

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
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
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* Protected Layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >

                <Route path="dashboard" element={<Dashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/new" element={<CourseForm />} />
                <Route path="courses/:id/edit" element={<CourseForm />} />
                <Route path="attendance" element={<Attendance />} />

                {/* Quizzes and Questions */}
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="quizzes/new" element={<CreateQuiz />} />
                <Route path="quizzes/bulk-upload" element={<BulkUpload />} />
                <Route path="quizzes/add-question" element={<AddQuestionPage />} />
                <Route path="quizzes/questions" element={<AddQuestion />} />
                <Route path="quizzes/:id/view" element={<ViewQuizDetails />} />
                <Route path="quizzes/:id/edit" element={<EditQuiz />} />
                <Route path="quizzes/:id/add-question" element={<AddQuestionPage />} />
                <Route path="quizzes/:id/questions" element={<AddQuestion />} />

                <Route path="classes" element={<Classes />} />
                <Route path="videos" element={<Videos />} />
                <Route path="interviews" element={<Interviews />} />
                <Route path="Exams" element={<Exams />} />
                <Route path="chat" element={<Chat />} />
                <Route path="resources" element={<Resources />} />

                {/* Curriculum */}
                <Route path="curriculum" element={<Curriculum />} />
                <Route path="curriculum/new" element={<CurriculumForm />} />
                <Route path="curriculum/:id/edit" element={<CurriculumForm />} />

                <Route path="mystudents" element={<Mystudents />} />
                <Route path="performance" element={<Performancereview />} />
                <Route path="coursematerials" element={<CourseMaterials />} />
                <Route path="badges" element={<Badges />} />
                <Route path="codingquestions" element={<CodingQuestions />} />
                <Route path="Certificates" element={<Certificates />} />
                <Route path="analytics" element={<Analytics />} />

                {/* Exam Management */}
                <Route path="exam-management" element={<ExamManagement />} />
                <Route path="exam-management/new" element={<CreateExamPage />} />
                <Route path="exam-management/add-question" element={<AddExamQuestion />} />
                <Route path="exam-management/view-question" element={<ViewQuestionDetails />} />
                <Route path="exam-management/view-exam" element={<ViewExamDetails />} />
                <Route path="exam-management/:id/edit" element={<ExamForm />} />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
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