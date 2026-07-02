
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.122:10000';

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
      // Optional: redirect to login
      window.location.href = '/login';
      // If using react-router: navigate('/login', { replace: true });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;