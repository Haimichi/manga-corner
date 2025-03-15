import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLatestManga,
  getPopularManga,
  getMangaChapters,
  getChapterDetails,
  getChapterPages
} from '../../services/mangadexApi';
import mangadexApi from '../../services/mangadexApi';

// Thunk lấy manga mới với phân trang
export const fetchLatestManga = createAsyncThunk(
  'mangadex/fetchLatestManga',
  async ({ page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await getLatestManga(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Không thể lấy manga mới nhất');
    }
  }
);

// Thunk lấy manga phổ biến với phân trang
export const fetchPopularManga = createAsyncThunk(
  'mangadex/fetchPopularManga',
  async ({ page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await getPopularManga(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Không thể lấy manga phổ biến');
    }
  }
);

// Thunk lấy danh sách chapter của manga
export const fetchMangaChapters = createAsyncThunk(
  'mangadex/fetchMangaChapters',
  async ({ mangaId, page = 1, limit = 30 }, { rejectWithValue }) => {
    try {
      const response = await getMangaChapters(mangaId, page, limit);
      return { ...response, mangaId };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Không thể lấy danh sách chapter');
    }
  }
);

// Thunk lấy thông tin chi tiết chapter
export const fetchChapterDetails = createAsyncThunk(
  'mangadex/fetchChapterDetails',
  async (chapterId, { rejectWithValue }) => {
    try {
      const response = await getChapterDetails(chapterId);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Không thể lấy thông tin chapter');
    }
  }
);

// Thunk lấy các trang của chapter
export const fetchChapterPages = createAsyncThunk(
  'mangadex/fetchChapterPages',
  async (chapterId, { rejectWithValue }) => {
    try {
      const response = await getChapterPages(chapterId);
      return { ...response, chapterId };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Không thể lấy trang của chapter');
    }
  }
);

// Đảm bảo cấu trúc dữ liệu đúng khi lưu vào store
export const getMangaDetailAsync = createAsyncThunk(
  'mangadex/getMangaDetail',
  async (mangaId, { rejectWithValue }) => {
    try {
      const response = await mangadexApi.getMangaDetail(mangaId);
      
      // Đảm bảo dữ liệu trả về đúng cấu trúc
      if (!response.data || !response.data.data) {
        return rejectWithValue('Dữ liệu manga không hợp lệ');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const mangadexSlice = createSlice({
  name: 'mangadex',
  initialState: {
    latestManga: [],
    popularManga: [],
    chapters: {},
    chapterDetails: {},
    chapterPages: {},
    pagination: {
      latest: { page: 1, limit: 12, total: 0, hasMore: true },
      popular: { page: 1, limit: 12, total: 0, hasMore: true }
    },
    loading: false,
    error: null,
    manga: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý manga mới
      .addCase(fetchLatestManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestManga.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        if (pagination.offset === 0) {
          state.latestManga = data.data || [];
        } else {
          state.latestManga = [...state.latestManga, ...(data.data || [])];
        }
        
        state.pagination.latest = {
          page: Math.floor(pagination.offset / pagination.limit) + 1,
          limit: pagination.limit,
          total: data.total || 0,
          hasMore: state.latestManga.length < (data.total || 0)
        };
        state.loading = false;
      })
      .addCase(fetchLatestManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
      })

      // Xử lý manga phổ biến
      .addCase(fetchPopularManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularManga.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        if (pagination.offset === 0) {
          state.popularManga = data.data || [];
        } else {
          state.popularManga = [...state.popularManga, ...(data.data || [])];
        }
        
        state.pagination.popular = {
          page: Math.floor(pagination.offset / pagination.limit) + 1,
          limit: pagination.limit,
          total: data.total || 0,
          hasMore: state.popularManga.length < (data.total || 0)
        };
        state.loading = false;
      })
      .addCase(fetchPopularManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
      })

      // Xử lý danh sách chapter
      .addCase(fetchMangaChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMangaChapters.fulfilled, (state, action) => {
        const { data, pagination, mangaId } = action.payload;
        if (!state.chapters[mangaId]) {
          state.chapters[mangaId] = {
            data: [],
            pagination: {}
          };
        }
        
        if (pagination.offset === 0) {
          state.chapters[mangaId].data = data.data || [];
        } else {
          state.chapters[mangaId].data = [...state.chapters[mangaId].data, ...(data.data || [])];
        }
        
        state.chapters[mangaId].pagination = {
          page: Math.floor(pagination.offset / pagination.limit) + 1,
          limit: pagination.limit,
          total: data.total || 0,
          hasMore: state.chapters[mangaId].data.length < (data.total || 0)
        };
        state.loading = false;
      })
      .addCase(fetchMangaChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
      })

      // Xử lý chi tiết chapter
      .addCase(fetchChapterDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapterDetails.fulfilled, (state, action) => {
        state.chapterDetails[action.meta.arg] = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchChapterDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
      })

      // Xử lý trang chapter
      .addCase(fetchChapterPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapterPages.fulfilled, (state, action) => {
        const { data, chapterId } = action.payload;
        state.chapterPages[chapterId] = data;
        state.loading = false;
      })
      .addCase(fetchChapterPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
      })

      // Xử lý chi tiết manga
      .addCase(getMangaDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.manga = action.payload.data;
        state.error = null;
      });
  }
});

export const { clearError } = mangadexSlice.actions;
export default mangadexSlice.reducer;