
import axios from 'axios';
import { API_BASE_URL } from '@/pages/services/api/api';


const API_BASE = API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/json',

  },
});

// Automatically add Bearer token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Handle 401 globally (logout / redirect to login)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('trainer_profile');
      // Optional: redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;