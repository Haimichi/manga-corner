import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi, mangaApi } from '../../services/api';

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

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    followedManga: [],
    followedMangaIds: [],
    readingHistory: [],
    loading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload?.data?.user || null;
        state.readingHistory = action.payload?.data?.user?.readingHistory || [];
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể tải thông tin người dùng';
        state.isAuthenticated = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload?.data?.user || state.profile;
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
        state.profile = action.payload?.data?.user || state.profile;
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
        state.profile = action.payload?.data?.user || state.profile;
      })
      .addCase(approveTranslator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể phê duyệt đơn đăng ký dịch giả';
      });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
