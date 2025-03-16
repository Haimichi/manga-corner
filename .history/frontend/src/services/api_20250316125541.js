import axios from 'axios';
import toast from 'react-hot-toast';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Thêm timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor thêm token vào header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Lỗi request:', error);
    return Promise.reject(error);
  }
);

// Xử lý response và errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 Unauthorized và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          // Thực hiện lại request gốc
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Đăng xuất nếu không thể refresh token
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    // Chi tiết lỗi cho debug
    console.error('API error:', error.response || error);
    
    // Hiển thị thông báo lỗi cho người dùng
    if (error.response) {
      const message = error.response.data?.message || 'Có lỗi xảy ra khi kết nối với server';
      toast.error(message);
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      toast.error('Không thể kết nối với server. Vui lòng kiểm tra kết nối internet của bạn.');
    } else {
      // Lỗi khác
      toast.error('Đã xảy ra lỗi khi thiết lập yêu cầu');
    }

    // Xử lý lỗi xác thực (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Chuyển hướng đến trang đăng nhập nếu không phải đang ở trang đăng nhập
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
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
