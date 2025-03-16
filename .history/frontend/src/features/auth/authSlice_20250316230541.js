import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import axios from 'axios';

// Thêm biến để kiểm soát không lặp vô hạn
let isRetrying = false;

// Thêm thunkAPI để kiểm tra token đã lưu
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Kiểm tra token
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Không tìm thấy token');
      }
      
      // Kiểm tra session hiện tại
      const response = await authService.getCurrentUser();
      console.log('Profile response:', response);
      
      return response;
    } catch (error) {
      console.error('Error checking auth:', error);
      
      // Xóa token nếu lỗi xác thực
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return rejectWithValue(error.response?.data?.message || 'Lỗi xác thực');
    }
  }
);

// Thunk action để đăng nhập
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Kiểm tra cấu trúc dữ liệu trước khi gửi
      console.log('loginUser thunk - credentials:', {
        email: credentials.email,
        password: '******',
        rememberMe: credentials.rememberMe
      });
      
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

// Thunk action để đăng ký
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi đăng ký');
    }
  }
);

// Thunk action để load thông tin user từ token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auth/me');
      return response.data.user || response.data; // Đảm bảo hàm trả về dữ liệu người dùng
    } catch (error) {
      console.error('Lỗi tải thông tin người dùng:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải thông tin người dùng');
    }
  }
);

// Thunk action để đăng xuất
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

// Thêm export cho tương thích ngược (nếu cần)
export const register = registerUser;
export const logout = logoutUser;

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  }
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
