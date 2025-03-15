import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLatestManga, getPopularManga, searchManga, getMangaDetails } from '../../services/mangadexApi';

// Thunk lấy manga mới
export const fetchLatestMangadex = createAsyncThunk(
  'mangadex/fetchLatest',
  async (limit = 12, { rejectWithValue }) => {
    try {
      const response = await getLatestManga(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Thunk lấy manga phổ biến
export const fetchPopularMangadex = createAsyncThunk(
  'mangadex/fetchPopular',
  async (limit = 12, { rejectWithValue }) => {
    try {
      const response = await getPopularManga(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Thunk tìm kiếm manga
export const searchMangadex = createAsyncThunk(
  'mangadex/search',
  async ({ query, limit = 30 }, { rejectWithValue }) => {
    try {
      const response = await searchManga(query, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Thunk lấy chi tiết manga
export const fetchMangadexDetails = createAsyncThunk(
  'mangadex/fetchDetails',
  async (mangaId, { rejectWithValue }) => {
    try {
      const response = await getMangaDetails(mangaId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  latestManga: [],
  popularManga: [],
  searchResults: [],
  currentManga: null,
  loading: {
    latest: false,
    popular: false,
    search: false,
    details: false
  },
  error: {
    latest: null,
    popular: null,
    search: null,
    details: null
  }
};

const mangadexSlice = createSlice({
  name: 'mangadex',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.error.search = null;
    },
    clearCurrentManga: (state) => {
      state.currentManga = null;
      state.error.details = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý trạng thái cho fetchLatestMangadex
      .addCase(fetchLatestMangadex.pending, (state) => {
        state.loading.latest = true;
        state.error.latest = null;
      })
      .addCase(fetchLatestMangadex.fulfilled, (state, action) => {
        state.loading.latest = false;
        state.latestManga = action.payload;
      })
      .addCase(fetchLatestMangadex.rejected, (state, action) => {
        state.loading.latest = false;
        state.error.latest = action.payload || 'Không thể lấy manga mới cập nhật';
      })
      
      // Xử lý trạng thái cho fetchPopularMangadex
      .addCase(fetchPopularMangadex.pending, (state) => {
        state.loading.popular = true;
        state.error.popular = null;
      })
      .addCase(fetchPopularMangadex.fulfilled, (state, action) => {
        state.loading.popular = false;
        state.popularManga = action.payload;
      })
      .addCase(fetchPopularMangadex.rejected, (state, action) => {
        state.loading.popular = false;
        state.error.popular = action.payload || 'Không thể lấy manga phổ biến';
      })
      
      // Xử lý trạng thái cho searchMangadex
      .addCase(searchMangadex.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchMangadex.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMangadex.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.payload || 'Không thể tìm kiếm manga';
      })
      
      // Xử lý trạng thái cho fetchMangadexDetails
      .addCase(fetchMangadexDetails.pending, (state) => {
        state.loading.details = true;
        state.error.details = null;
      })
      .addCase(fetchMangadexDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.currentManga = action.payload;
      })
      .addCase(fetchMangadexDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.error.details = action.payload || 'Không thể lấy chi tiết manga';
      });
  }
});

export const { clearSearch, clearCurrentManga } = mangadexSlice.actions;
export default mangadexSlice.reducer;