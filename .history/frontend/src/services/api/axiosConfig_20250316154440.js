import axios from 'axios';
import { store } from '../../store';
import { login, logout } from '../../features/auth/authSlice';

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
        // Thử gọi API refresh token thủ công vì không có refreshToken action
        const refreshResponse = await axios.post('/api/auth/refresh-token', {}, {
          withCredentials: true
        });
        
        if (refreshResponse.data && refreshResponse.data.token) {
          // Cập nhật token trong store
          store.dispatch(login({
            user: refreshResponse.data.user,
            token: refreshResponse.data.token
          }));
          
          // Thêm token mới vào request gốc và thử lại
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
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