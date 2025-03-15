import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mangaApi from '../../services/api/mangaApi';

const initialState = {
  latestManga: [],
  popularManga: [],
  myManga: [],
  pendingManga: [],
  mangaDetail: null,
  loading: false,
  error: null,
};

export const fetchLatestManga = createAsyncThunk(
  'manga/fetchLatest',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getLatest(params);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải manga mới:', error);
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải manga mới' });
    }
  }
);

export const fetchPopularManga = createAsyncThunk(
  'manga/fetchPopular',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getPopular(params);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải manga phổ biến:', error);
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải manga phổ biến' });
    }
  }
);

export const fetchPendingManga = createAsyncThunk(
  'manga/fetchPendingManga',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getPendingManga();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải truyện chờ phê duyệt' });
    }
  }
);

export const fetchMyManga = createAsyncThunk(
  'manga/fetchMyManga',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getMyManga();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải truyện của bạn' });
    }
  }
);

export const createManga = createAsyncThunk(
  'manga/createManga',
  async (mangaData, { rejectWithValue }) => {
    try {
      const response = await mangaApi.createManga(mangaData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tạo truyện mới' });
    }
  }
);

export const approveManga = createAsyncThunk(
  'manga/approveManga',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mangaApi.approveManga(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi phê duyệt truyện' });
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

export const getMangaDetail = createAsyncThunk(
  'manga/getMangaDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mangaApi.getMangaById(id);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải chi tiết manga:', error);
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải chi tiết manga' });
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
      .addCase(fetchMyManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyManga.fulfilled, (state, action) => {
        state.loading = false;
        state.myManga = action.payload?.data || [];
      })
      .addCase(fetchMyManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể tải truyện của bạn';
      })
      .addCase(fetchPendingManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingManga.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingManga = action.payload?.data || [];
      })
      .addCase(fetchPendingManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể tải truyện chờ phê duyệt';
      })
      .addCase(createManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManga.fulfilled, (state, action) => {
        state.loading = false;
        state.myManga.unshift(action.payload?.data);
      })
      .addCase(createManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể tạo truyện mới';
      })
      .addCase(approveManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveManga.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingManga = state.pendingManga.filter(manga => manga._id !== action.payload?.data._id);
      })
      .addCase(approveManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể phê duyệt truyện';
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
      })
      .addCase(getMangaDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMangaDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.mangaDetail = action.payload?.data || null;
      })
      .addCase(getMangaDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Không thể tải chi tiết manga';
      });
  }
});

export const { clearError } = mangaSlice.actions;
export default mangaSlice.reducer;
