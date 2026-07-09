import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/pages/services/api/api';

export const useCoursesAndStudents = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
    });

    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get('/trainer/courses');
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };

    const fetchAllStudents = async () => {
      try {
        const res = await axiosInstance.get('/trainer/my-students');
        setAllStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load all students:', err);
      }
    };

    if (token) {
      fetchCourses();
      fetchAllStudents();
    }
  }, []);

  return { courses, allStudents };
};
