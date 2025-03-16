import axios from 'axios';

// URL cơ sở cho API
const API_URL = '/auth';

// Export riêng lẻ từng hàm
export const login = async (credentials) => {
  try {
    // Kiểm tra cấu trúc dữ liệu đăng nhập
    const loginData = {};
    
    // Nếu credentials là object có chứa email lồng nhau, tức là cấu trúc không đúng
    if (credentials.email && typeof credentials.email === 'object') {
      // Lấy dữ liệu từ cấu trúc lồng
      loginData.email = credentials.email.email;
      loginData.password = credentials.email.password;
      console.log('Đã sửa lại cấu trúc dữ liệu đăng nhập');
    } else {
      // Nếu credentials đã có cấu trúc đúng
      loginData.email = credentials.email;
      loginData.password = credentials.password;
    }
    
    console.log('Gửi request đăng nhập đến: /auth/login');
    console.log('Dữ liệu đăng nhập:', { email: loginData.email, password: '******' });
    
    const response = await axios.post('/auth/login', loginData);
    
    if (response.data.token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      
      // Thiết lập token cho mọi request tiếp theo
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Lưu thông tin người dùng
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
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

export const verifyEmail = async (email, otp) => {
  // Implementation of verifyEmail function
};

export const resendOtp = async (email) => {
  // Implementation of resendOtp function
};

// Vẫn có thể giữ default export 
export default {
  login,
  register,
  getCurrentUser,
  logout,
  verifyEmail,
  resendOtp
}; 