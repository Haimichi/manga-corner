import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi, mangaApi } from '../../services/api';
import api from '../../services/api';
import { login, logout, checkAuth } from '../auth/authSlice';

export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi không xác định' });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi không xác định' });
    }
  }
);

export const getFollowedManga = createAsyncThunk(
  'user/getFollowedManga',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getFollowedManga();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi không xác định' });
    }
  }
);

export const followManga = createAsyncThunk(
  'user/followManga',
  async (mangaId, { rejectWithValue }) => {
    try {
      const response = await mangaApi.follow(mangaId);
      return { ...response.data, mangaId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi không xác định' });
    }
  }
);

export const unfollowManga = createAsyncThunk(
  'user/unfollowManga',
  async (mangaId, { rejectWithValue }) => {
    try {
      await mangaApi.unfollow(mangaId);
      return { mangaId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi không xác định' });
    }
  }
);

export const applyTranslator = createAsyncThunk(
  'user/applyTranslator',
  async (translatorData, { rejectWithValue }) => {
    try {
      const response = await userApi.applyTranslator(translatorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi đăng ký làm dịch giả' });
    }
  }
);

export const getPendingTranslators = createAsyncThunk(
  'user/getPendingTranslators',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getPendingTranslators();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải danh sách đơn đăng ký dịch giả' });
    }
  }
);

export const approveTranslator = createAsyncThunk(
  'user/approveTranslator',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userApi.approveTranslator(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi phê duyệt đơn đăng ký dịch giả' });
    }
  }
);

export const rejectTranslator = createAsyncThunk(
  'user/rejectTranslator',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userApi.rejectTranslator(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi từ chối dịch giả' });
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/profile');
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    followedManga: [],
    followedMangaIds: [],
    readingHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || null;
        state.readingHistory = action.payload?.data?.user?.readingHistory || [];
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể tải thông tin người dùng';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || state.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể cập nhật hồ sơ';
      })
      .addCase(getFollowedManga.fulfilled, (state, action) => {
        state.followedManga = action.payload?.data || [];
        state.followedMangaIds = (action.payload?.data || []).map(item => item.mangaId);
      })
      .addCase(getFollowedManga.rejected, (state, action) => {
        state.error = action.payload?.message || 'Không thể tải danh sách theo dõi';
      })
      .addCase(followManga.fulfilled, (state, action) => {
        if (action.payload?.mangaId) {
          state.followedMangaIds.push(action.payload.mangaId);
        }
      })
      .addCase(unfollowManga.fulfilled, (state, action) => {
        if (action.payload?.mangaId) {
          state.followedMangaIds = state.followedMangaIds.filter(
            id => id !== action.payload.mangaId
          );
        }
      })
      .addCase(applyTranslator.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || state.user;
      })
      .addCase(applyTranslator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể đăng ký làm dịch giả';
      })
      .addCase(getPendingTranslators.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTranslators = action.payload?.data || [];
      })
      .addCase(getPendingTranslators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể tải danh sách đơn đăng ký dịch giả';
      })
      .addCase(approveTranslator.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || state.user;
      })
      .addCase(approveTranslator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể phê duyệt đơn đăng ký dịch giả';
      })
      .addCase(rejectTranslator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectTranslator.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTranslators = state.pendingTranslators.filter(
          translator => translator._id !== action.payload?.data?._id
        );
      })
      .addCase(rejectTranslator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Lỗi khi từ chối dịch giả';
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload.data && action.payload.data.user) {
          state.user = action.payload.data.user;
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload && action.payload.data && action.payload.data.user) {
          state.user = action.payload.data.user;
        }
      });
  }
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
