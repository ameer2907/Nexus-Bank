import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://nexus-backend-vw2e.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});


// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      if (message.includes('expired') || message.includes('Invalid token') || message.includes('No token')) {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
