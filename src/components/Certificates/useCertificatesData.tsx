import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { axiosInstance } from "./api";
import { Course, Certificate } from "./Types";

export const useCertificatesData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificateRows, setCertificateRows] = useState<Certificate[]>([]);
  const [filterCourseId, setFilterCourseId] = useState<string>("");
  const [totalCertificates, setTotalCertificates] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const res = await axiosInstance.get("/courses");
        const coursesData = Array.isArray(res.data) ? res.data : [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setFilterCourseId(String(coursesData[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch courses list:", err);
      }
    };
    fetchCoursesList();
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!filterCourseId.trim()) {
        setCertificateRows([]);
        setTotalCertificates(0);
        return;
      }
      try {
        const res = await axiosInstance.get(`/courses/${filterCourseId}/certificates`);
        if (res.data && res.data.certificates) {
          const fetchedCerts = res.data.certificates.map((cert: any) => {
            const localDate = (() => {
              if (!cert.issued_at) return "-";
              try {
                const d = new Date(cert.issued_at);
                if (isNaN(d.getTime())) return "-";
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              } catch {
                return "-";
              }
            })();

            return {
              initials: cert.student_name ? cert.student_name.substring(0, 2).toUpperCase() : "NA",
              name: cert.student_name,
              studentId: cert.student_id.toString(),
              courseId: res.data.course_id.toString(),
              certificateNo: cert.certificate_no || "-",
              date: localDate,
              status: cert.status === "valid" ? "Issued" : "Pending",
              download_url: cert.download_url,
            };
          });

          setCertificateRows(fetchedCerts);
          setTotalCertificates(res.data.total_certificates || 0);
        } else {
          setTotalCertificates(0);
        }
      } catch (err: any) {
        setCertificateRows([]);
        setTotalCertificates(0);
        const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || "Failed to fetch certificates";
        toast.error(errorMsg);
        console.error("Failed to fetch certificates:", err);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCertificates();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterCourseId, refreshTrigger]);

  const thisMonthCertificatesCount = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return certificateRows.filter(cert => {
      if (cert.date && cert.date !== "-") {
        const parts = cert.date.split("/");
        if (parts.length === 3) {
          const month = Number(parts[1]) - 1;
          const year = Number(parts[2]);
          return month === currentMonth && year === currentYear;
        }
      }
      return false;
    }).length;
  }, [certificateRows]);

  return {
    courses,
    certificateRows,
    filterCourseId,
    setFilterCourseId,
    totalCertificates,
    thisMonthCertificatesCount,
    setRefreshTrigger
  };
};
