import axiosClient from './axiosConfig';

const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await axiosClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      throw error;
    }
  },
  
  refreshToken: async () => {
    try {
      const response = await axiosClient.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Lỗi làm mới token:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng hiện tại:', error);
      throw error;
    }
  },
  
  // Các phương thức khác...
};

export default authApi; 