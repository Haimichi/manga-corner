import axios from 'axios';

export const login = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    
    if (response.data.success) {
      // Lưu token vào localStorage
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Thiết lập token cho tất cả các yêu cầu sau này
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    
    if (response.data.success) {
      // Lưu token vào localStorage
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Thiết lập token cho tất cả các yêu cầu sau này
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
  return true;
}; 