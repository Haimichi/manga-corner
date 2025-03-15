import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Thêm interceptor để log request URL
axiosClient.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.url);
    console.log('Request Params:', config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosClient; 