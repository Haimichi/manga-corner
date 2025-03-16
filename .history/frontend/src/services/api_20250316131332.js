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

// Biến để theo dõi quá trình refresh token đang diễn ra
let isRefreshing = false;
let failedQueue = [];

// Xử lý hàng đợi các request failed
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
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error(`API Error [${originalRequest?.url}]:`, error.message);
    
    // Nếu lỗi 401 Unauthorized và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { 
            withCredentials: true
          }
        );
        
        if (response.data && response.data.token) {
          const newToken = response.data.token;
          // Lưu token mới
          localStorage.setItem('token', newToken);
          // Cập nhật header cho tất cả request tương lai
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          // Cập nhật header cho request hiện tại
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Xử lý hàng đợi các request failed
          processQueue(null, newToken);
          
          console.log('Token đã được làm mới thành công');
          return api(originalRequest);
        } else {
          console.log('Không nhận được token mới');
          processQueue(new Error('Không nhận được token mới'));
          // Đăng xuất người dùng khi không thể refresh token
          store.dispatch(logout());
        }
      } catch (refreshError) {
        console.error('Lỗi khi refresh token:', refreshError);
        processQueue(refreshError);
        
        // Đăng xuất khi không thể refresh token
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          console.log('Session hết hạn, đăng xuất...');
          // Chỉ đăng xuất nếu không phải đang ở trang đăng nhập/đăng ký
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            store.dispatch(logout());
            toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          }
        }
      } finally {
        isRefreshing = false;
      }
      
      return Promise.reject(error);
    }
    
    // Hiển thị thông báo lỗi cho người dùng (chỉ hiển thị cho lỗi không phải 401)
    if (error.response && error.response.status !== 401) {
      const message = error.response.data?.message || 'Có lỗi xảy ra khi kết nối với server';
      toast.error(message);
    } else if (!error.response) {
      // Không có response
      toast.error('Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối internet.');
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
