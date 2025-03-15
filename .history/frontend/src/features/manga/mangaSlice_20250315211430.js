import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mangaApi } from '../../services/api';

export const fetchLatestManga = createAsyncThunk(
  'manga/fetchLatest',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getLatest(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPopularManga = createAsyncThunk(
  'manga/fetchPopular',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getPopular(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchManga = createAsyncThunk(
  'manga/search',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mangaApi.search(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const mangaSlice = createSlice({
  name: 'manga',
  initialState: {
    latestManga: [],
    popularManga: [],
    searchResults: [],
    currentManga: null,
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
      .addCase(fetchLatestManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestManga.fulfilled, (state, action) => {
        state.loading = false;
        state.latestManga = action.payload?.data || [];
      })
      .addCase(fetchLatestManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Có lỗi xảy ra khi tải dữ liệu manga mới';
      })
      .addCase(fetchPopularManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularManga.fulfilled, (state, action) => {
        state.loading = false;
        state.popularManga = action.payload?.data || [];
      })
      .addCase(fetchPopularManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Có lỗi xảy ra khi tải dữ liệu manga phổ biến';
      })
      .addCase(searchManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchManga.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload?.data || [];
      })
      .addCase(searchManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Có lỗi xảy ra khi tìm kiếm manga';
      });
  }
});

export const { clearError } = mangaSlice.actions;
export default mangaSlice.reducer;
