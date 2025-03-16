import axios from 'axios';

// Tạo axios instance với baseURL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor thêm token vào header Authorization
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi global
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default API; 