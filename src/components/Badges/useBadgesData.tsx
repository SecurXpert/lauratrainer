import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "./api";
import { Course, Badge, Student } from "./Types";

export const useBadgesData = (selectedCourseId: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get<Course[]>("/trainer/courses");
        setCourses(res.data || []);
      } catch (err: any) {
        setError("Failed to load courses");
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/trainer/my-students");
        if (Array.isArray(res.data)) {
          setStudents(res.data);
        } else {
          setStudents([]);
          toast.warning("Student list format is invalid");
        }
      } catch (err: any) {
        setStudents([]);
        toast.error("Failed to load students");
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        if (!selectedCourseId) {
          if (courses.length === 0) {
            setBadges([]);
            return;
          }
          const promises = courses.map((course) =>
            api.get<Badge[]>(`/courses/${course.id}/badges`).catch(() => ({ data: [] }))
          );
          const results = await Promise.all(promises);
          const allBadges = results.flatMap((res) => res.data || []);
          setBadges(allBadges);
        } else {
          const res = await api.get<Badge[]>(`/courses/${selectedCourseId}/badges`);
          setBadges(res.data || []);
        }
      } catch (err: any) {
        console.error("Badges fetch failed:", err);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [selectedCourseId, courses]);

  return { courses, badges, setBadges, students, loading, setLoading, error };
};
