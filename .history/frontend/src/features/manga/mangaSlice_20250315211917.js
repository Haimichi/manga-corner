import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mangaApi from '../../services/api/mangaApi';

const initialState = {
  latestManga: [],
  popularManga: [],
  mangaDetail: null,
  loading: false,
  error: null,
};

export const fetchLatestManga = createAsyncThunk(
  'manga/fetchLatest',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getLatest(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải manga mới' });
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
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải manga phổ biến' });
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
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
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
        state.error = action.payload?.message || action.error?.message || 'Không thể tải manga mới';
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
        state.error = action.payload?.message || action.error?.message || 'Không thể tải manga phổ biến';
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
