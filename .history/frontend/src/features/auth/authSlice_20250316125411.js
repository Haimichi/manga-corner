import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

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
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      // Thử refresh token
      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        if (refreshResponse.data.token) {
          localStorage.setItem('token', refreshResponse.data.token);
          return refreshResponse.data;
        }
        return rejectWithValue('Không thể làm mới token');
      } catch (refreshError) {
        // Xóa token nếu không thể refresh
        localStorage.removeItem('token');
        return rejectWithValue('Phiên đăng nhập hết hạn');
      }
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Lưu token vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Token đã được lưu trong HTTP-only cookie bởi backend
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API để hủy token và xóa cookie
      await api.post('/auth/logout');
      
      // Xóa token trong localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      // Vẫn xóa token trong localStorage ngay cả khi API lỗi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!localStorage.getItem('token'), // Kiểm tra token ngay lập tức
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        if (action.payload.token) {
          state.token = action.payload.token;
        }
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.loading = false;
      })
      
      // Register case
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Đăng ký thất bại';
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
