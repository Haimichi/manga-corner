import axios from 'axios';

// Sửa đổi cấu hình để đảm bảo kết nối đúng với backend
const API_URL = 'http://localhost:5000/api';

console.log('Connecting to API at:', API_URL);

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // Thêm timeout để tránh chờ quá lâu
});

// Cấu hình interceptors
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 