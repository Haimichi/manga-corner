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
    // Xóa toàn bộ logic refresh token và chỉ trả về lỗi
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Cài đặt cache cho các request API
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Hàm lấy dữ liệu với cache
const cachedGet = async (url, params = {}, options = {}) => {
  // Tạo cache key từ URL và params
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  const now = Date.now();
  
  // Kiểm tra cache
  if (apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Cache hit] ${url}`);
      return cached.data;
    }
  }
  
  // Thực hiện request mới nếu không có cache hoặc cache đã hết hạn
  const response = await api.get(url, { params, ...options });
  
  // Lưu kết quả vào cache
  apiCache.set(cacheKey, {
    timestamp: now,
    data: response.data
  });
  
  return response.data;
};

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
  getLatest: async (params = {}) => {
    try {
      const response = await axios.get(`/api/mangadex/latest`, { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy manga mới nhất:', error);
      throw error;
    }
  },

  getPopular: async (params = {}) => {
    try {
      const response = await axios.get(`/api/mangadex/popular`, { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy manga phổ biến:', error);
      throw error;
    }
  },

  getMangaDetails: async (id) => {
    try {
      console.log(`Đang tải thông tin manga có ID: ${id}`);
      const response = await axios.get(`/api/mangadex/manga/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin manga ${id}:`, error);
      throw error;
    }
  },

  search: (params) => 
    cachedGet('/mangadex/search', params),
    
  getById: (id) => 
    cachedGet(`/mangadex/manga/${id}`),
    
  getChapters: async (mangaId) => {
    try {
      const response = await axios.get(`/api/mangadex/manga/${mangaId}/chapters`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chapters của manga ${mangaId}:`, error);
      throw error;
    }
  },
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

// Thiết lập URL gốc cho axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Thêm interceptor để log tất cả request
axios.interceptors.request.use(
  config => {
    console.log(`Gửi request ${config.method.toUpperCase()} đến ${config.url}`);
    return config;
  },
  error => {
    console.error('Lỗi khi gửi request:', error);
    return Promise.reject(error);
  }
);

export default api;
