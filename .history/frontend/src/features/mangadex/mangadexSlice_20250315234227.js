import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLatestManga,
  getPopularManga,
  getMangaChapters,
  getChapterDetails,
  getChapterPages,
  getMangaDetails,
  searchManga
} from '../../services/mangadexApi';

// Thunk lấy manga mới với phân trang
export const fetchLatestManga = createAsyncThunk(
  'mangadex/fetchLatestManga',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLatestManga(params);
      return response;
    } catch (error) {
      console.error('Lỗi trong fetchLatestManga thunk:', error);
      return rejectWithValue(error.message || 'Không thể lấy truyện mới cập nhật');
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
  async (mangaId, { rejectWithValue }) => {
    try {
      if (!mangaId || mangaId === 'undefined') {
        return rejectWithValue('ID manga không hợp lệ');
      }
      
      // Gọi API không chỉ định ngôn ngữ
      const response = await getMangaChapters(mangaId);
      console.log("Response từ getMangaChapters:", response);
      return response;
    } catch (error) {
      console.error('Lỗi trong fetchMangaChapters thunk:', error);
      return rejectWithValue(error.message || 'Không thể lấy danh sách chapter');
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
      if (!mangaId || mangaId === 'undefined') {
        return rejectWithValue('ID manga không hợp lệ');
      }
      
      const response = await getMangaDetails(mangaId);
      
      // Đảm bảo dữ liệu trả về đúng cấu trúc
      if (!response.data || !response.data.data) {
        return rejectWithValue('Dữ liệu manga không hợp lệ');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể lấy thông tin manga');
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
        state.loading = false;
        
        // Kiểm tra và ghi log cấu trúc dữ liệu
        console.log('fetchLatestManga.fulfilled payload:', action.payload);
        
        if (action.payload && action.payload.data && action.payload.data.data) {
          state.latestManga = action.payload.data.data;
        } else if (action.payload && action.payload.data) {
          state.latestManga = action.payload.data;
        } else {
          state.latestManga = [];
        }
        
        if (action.payload && action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        state.error = null;
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
        state.loading = false;
        
        // Log để debug
        console.log('fetchMangaChapters.fulfilled payload:', action.payload);
        
        // Kiểm tra cấu trúc dữ liệu và gán chapters
        if (action.payload?.data?.data) {
          console.log(`Tìm thấy ${action.payload.data.data.length} chapters`);
          state.chapters = action.payload.data.data;
        } else {
          console.log("Không tìm thấy dữ liệu chapter");
          state.chapters = [];
        }
        
        state.error = null;
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
        
        // Kiểm tra cấu trúc dữ liệu đúng
        if (action.payload && action.payload.data && action.payload.data.data) {
          state.manga = action.payload.data.data;
        } else if (action.payload && action.payload.data) {
          state.manga = action.payload.data;
        } else {
          state.manga = null;
        }
        
        state.error = null;
      });
  }
});

export const { clearError } = mangadexSlice.actions;
export default mangadexSlice.reducer;