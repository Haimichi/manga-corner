import axios from 'axios';

// Sửa lại URL để tránh lỗi trùng lặp /api
const API_URL = 'http://localhost:5000';

console.log('Khởi tạo kết nối API tại:', API_URL);

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Thêm interceptor để debug request
axiosClient.interceptors.request.use(
  (config) => {
    console.log(`Gửi request đến: ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Cải thiện xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`Nhận response thành công từ: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`Lỗi từ ${error.config?.url}:`, error.message);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 