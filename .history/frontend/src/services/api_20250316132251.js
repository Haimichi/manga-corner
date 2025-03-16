import axios from 'axios';
import toast from 'react-hot-toast';
import { store } from '../store';
import { logout, checkAuth } from '../features/auth/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Quan trọng để gửi/nhận cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Biến để tránh nhiều request refresh token cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response và lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        const res = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { 
            withCredentials: true // Quan trọng để gửi cookies
          }
        );
        
        if (res.data && res.data.token) {
          const newToken = res.data.token;
          
          // Lưu token mới
          localStorage.setItem('token', newToken);
          
          // Lưu thông tin user nếu có
          if (res.data.data && res.data.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
          }
          
          // Cập nhật header
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Xử lý hàng đợi request
          processQueue(null, newToken);
          
          return api(originalRequest);
        } else {
          processQueue(new Error('Không nhận được token mới'));
          store.dispatch(logout());
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        
        // Không tự động đăng xuất khi ở trang đăng nhập/đăng ký
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          store.dispatch(logout());
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/signup', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getProfile: () => api.get('/users/profile')
};

// Manga APIs
export const mangaApi = {
  getLatest: (page = 1, limit = 20) => api.get(`/manga/latest?page=${page}&limit=${limit}`),
  getPopular: (page = 1, limit = 20) => api.get(`/manga/popular?page=${page}&limit=${limit}`),
  search: (params) => api.get('/manga/search', { params }),
  getById: (id) => api.get(`/manga/${id}`),
  getChapters: (id) => api.get(`/manga/${id}/chapters`),
  follow: (id) => api.post(`/manga/${id}/follow`),
  unfollow: (id) => api.delete(`/manga/${id}/follow`)
};

// User APIs
export const userApi = {
  updateProfile: (data) => api.patch('/users/profile', data),
  updatePassword: (data) => api.patch('/users/password', data),
  getReadingHistory: () => api.get('/users/reading-history'),
  updateReadingHistory: (data) => api.post('/users/reading-history', data),
  getFollowedManga: () => api.get('/users/following')
};

export default api;
