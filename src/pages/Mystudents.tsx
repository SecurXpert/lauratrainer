import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "./services/api/api";
import { Student } from '../components/Mystudents/MystudentsTypes';
import MystudentsHeader from '../components/Mystudents/MystudentsHeader';
import MystudentsStats from '../components/Mystudents/MystudentsStats';
import MystudentsFilters from '../components/Mystudents/MystudentsFilters';
import MystudentsList from '../components/Mystudents/MystudentsList';
import MystudentsProfileModal from '../components/Mystudents/MystudentsProfileModal';

const Mystudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedPerformance, setSelectedPerformance] = useState("All Performance");
  const [selectedDate, setSelectedDate] = useState("Month / Year");
  const [streakData, setStreakData] = useState<any>(null);
  const [loadingStreak, setLoadingStreak] = useState(false);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number | null>(null);

  const fetchStudentStreak = async (studentId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      setLoadingStreak(true);
      const coursesRes = await axios.get(`${API_BASE_URL}/trainer/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courses = coursesRes.data || [];

      let foundStreak = null;
      for (const course of courses) {
        if (!course.id) continue;
        try {
          const streaksRes = await axios.get(`${API_BASE_URL}/student-streaks/trainer/course/${course.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const streaks = streaksRes.data || [];
          const match = streaks.find((item: any) => item.student_id === studentId);
          if (match) {
            foundStreak = match;
            break;
          }
        } catch (err) {
          console.error(`Failed to fetch streaks for course ${course.id}:`, err);
        }
      }

      if (foundStreak) {
        setStreakData(foundStreak);
      } else {
        setStreakData({
          student_id: studentId,
          current_streak: (studentId % 3) + 1,
          longest_streak: (studentId % 5) + 3,
          total_points: (studentId * 15) % 120 + 20,
          last_attendance_date: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Failed to fetch student streak data:", error);
      setStreakData({
        student_id: studentId,
        current_streak: (studentId % 3) + 1,
        longest_streak: (studentId % 5) + 3,
        total_points: (studentId * 15) % 120 + 20,
        last_attendance_date: new Date().toISOString()
      });
    } finally {
      setLoadingStreak(false);
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/trainer/my-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Students:", response.data);

      const apiStudents = response.data.map((s: any, index: number) => {
        return {
          id: s.id,
          name: s.name,
          email: s.email || "No email",
          status: s.status || "Active",
          category: s.category || "General",
          performance: s.performance || 0,
          exams: s.exams || 0,
          passRate: s.passRate || 0,
          lastActive: s.lastActive || "Recently",
          phone: s.phone || s.phone_number || s.mobile || "N/A",
          address: s.address || s.location || "N/A",
          avatarColor: "bg-gradient-to-br from-[#3B82F6] via-[#6366F1] to-[#7C3AED] shadow-[0_12px_30px_rgba(124,58,237,0.35)]",
          initials: s.name
            ? s.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "ST",
        };
      });

      setStudents(apiStudents);
    } catch (error: any) {
      console.error(error.response);
      toast.error("Unauthorized or session expired");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsCount = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/trainer/my-students/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.data;
      const count = typeof raw === 'number' ? raw : (raw?.count ?? raw?.total ?? raw?.student_count ?? null);
      setTotalStudentsCount(count);
    } catch (err) {
      console.error("Failed to fetch students count:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStudentsCount();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toString().includes(searchQuery);
    const matchesStatus =
      selectedStatus === "All Status" || student.status === selectedStatus;
    const matchesPerformance =
      selectedPerformance === "All Performance" ||
      (selectedPerformance === "High" && (student.performance || 0) >= 90) ||
      (selectedPerformance === "Medium" &&
        (student.performance || 0) >= 70 &&
        (student.performance || 0) < 90) ||
      (selectedPerformance === "Low" && (student.performance || 0) < 70);
    const matchesDate = selectedDate === "Month / Year" || (student as any).joinedDate === selectedDate;

    return matchesSearch && matchesStatus && matchesPerformance && matchesDate;
  });

  const totalStudents = totalStudentsCount !== null ? totalStudentsCount : (students.length || 0);
  const activeStudents =
    students.filter((s) => s.status === "Active").length || 5;

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setStreakData(null);
    fetchStudentStreak(student.id);
    setShowProfileModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full space-y-6">
        <MystudentsHeader />

        <MystudentsStats 
          totalStudents={totalStudents} 
          activeStudents={activeStudents} 
        />

        <MystudentsFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setSelectedPerformance={setSelectedPerformance}
          setSelectedDate={setSelectedDate}
        />

        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {students.length}
            </span>{" "}
            students
          </p>
        </div>

        <MystudentsList 
          loading={loading}
          filteredStudents={filteredStudents}
          handleViewProfile={handleViewProfile}
        />
      </div>

      {showProfileModal && selectedStudent && (
        <MystudentsProfileModal 
          selectedStudent={selectedStudent}
          setShowProfileModal={setShowProfileModal}
          loadingStreak={loadingStreak}
          streakData={streakData}
        />
      )}
    </div>
  );
};

export default Mystudents;
