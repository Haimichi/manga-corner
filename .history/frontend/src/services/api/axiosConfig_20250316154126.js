import axios from 'axios';
import store from '../../store';
import { refreshToken, logout } from '../../features/auth/authSlice';

// Tạo đối tượng axios với cấu hình cơ bản
const axiosClient = axios.create({
  baseURL: '/api', // Thêm tiền tố /api vào tất cả request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây
});

// Thêm interceptor cho request
axiosClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response để xử lý lỗi và refresh token
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Thử refresh token
        await store.dispatch(refreshToken());
        const state = store.getState();
        const newToken = state.auth.token;
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 