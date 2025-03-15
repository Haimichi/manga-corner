import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../../services/api';
import { mangaApi } from '../../services/api';

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

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    followedManga: [],
    followedMangaIds: [],
    readingHistory: [],
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
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data.user;
        state.readingHistory = action.payload.data.user.readingHistory || [];
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi không xác định';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi không xác định';
      })
      .addCase(getFollowedManga.fulfilled, (state, action) => {
        state.followedManga = action.payload.data;
        state.followedMangaIds = action.payload.data.map(item => item.mangaId);
      })
      .addCase(followManga.fulfilled, (state, action) => {
        state.followedMangaIds.push(action.payload.mangaId);
      })
      .addCase(unfollowManga.fulfilled, (state, action) => {
        state.followedMangaIds = state.followedMangaIds.filter(
          id => id !== action.payload.mangaId
        );
      });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
