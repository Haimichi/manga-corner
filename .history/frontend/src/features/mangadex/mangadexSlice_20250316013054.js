import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLatestManga,
  getPopularManga,
  getMangaChapters,
  getChapterDetails,
  getChapterPages,
  getMangaDetails
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
  async (mangaId, { rejectWithValue, getState }) => {
    try {
      // Kiểm tra cache trước
      const { cache } = getState().mangadex;
      if (cache.mangaChapters[mangaId]) {
        console.log('Sử dụng cache cho chapters:', mangaId);
        return { data: { data: cache.mangaChapters[mangaId] }, fromCache: true };
      }
      
      const response = await getMangaChapters(mangaId, {
        limit: 100,
        offset: 0,
        'translatedLanguage[]': ['vi', 'en'],
        'includes[]': ['scanlation_group'],
        'order[chapter]': 'desc'
      });
      
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chapter:', error);
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
  async (chapterId, { getState, rejectWithValue }) => {
    try {
      // Kiểm tra xem đã có trong cache chưa
      const { chapterPages } = getState().mangadex;
      if (chapterPages[chapterId] && chapterPages[chapterId].length > 0) {
        console.log(`Sử dụng dữ liệu cache cho chapter ${chapterId}`);
        return { data: chapterPages[chapterId], chapterId };
      }
      
      console.log(`Tải dữ liệu mới cho chapter ${chapterId}`);
      const response = await getChapterPages(chapterId);
      
      // Thêm prefetch cho các hình ảnh
      if (response.data) {
        // Prefetch hình ảnh trong background
        setTimeout(() => {
          response.data.forEach(page => {
            const img = new Image();
            img.src = page.url;
          });
        }, 100);
      }
      
      return { ...response, chapterId };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Không thể lấy trang của chapter');
    }
  }
);

// Thêm cơ chế cache cleanup để tránh memory leak
export const cleanupChapterCache = createAsyncThunk(
  'mangadex/cleanupChapterCache',
  async (_, { getState }) => {
    const { chapterPages } = getState().mangadex;
    const chaptersToKeep = Object.keys(chapterPages).slice(-5); // Giữ lại 5 chapter gần nhất
    
    return { chaptersToKeep };
  }
);

// Đảm bảo cấu trúc dữ liệu đúng khi lưu vào store
export const getMangaDetailAsync = createAsyncThunk(
  'mangadex/getMangaDetail',
  async (mangaId, { rejectWithValue, getState }) => {
    try {
      // Kiểm tra cache trước
      const { cache } = getState().mangadex;
      if (cache.mangaDetails[mangaId]) {
        console.log('Sử dụng cache cho thông tin manga:', mangaId);
        return { data: cache.mangaDetails[mangaId], fromCache: true };
      }
      
      const response = await getMangaDetails(mangaId);
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin manga:', error);
      return rejectWithValue(error.message || 'Không thể lấy thông tin manga');
    }
  }
);

const mangadexSlice = createSlice({
  name: 'mangadex',
  initialState: {
    latestManga: [],
    popularManga: [],
    chapters: [],
    chapterDetails: {},
    chapterPages: {},
    pagination: {
      latest: { page: 1, limit: 12, total: 0, hasMore: true },
      popular: { page: 1, limit: 12, total: 0, hasMore: true }
    },
    loading: false,
    error: null,
    manga: null,
    // Thêm cache để tối ưu hiệu suất
    cache: {
      mangaDetails: {}, // mangaId -> mangaDetails
      mangaChapters: {}, // mangaId -> chapters
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOldCache: (state) => {
      // Giới hạn số lượng chapter được lưu trong cache
      const chaptersInCache = Object.keys(state.chapterPages);
      if (chaptersInCache.length > 10) { // Giữ tối đa 10 chapter
        const chaptersToRemove = chaptersInCache.slice(0, chaptersInCache.length - 10);
        chaptersToRemove.forEach(chapterId => {
          delete state.chapterPages[chapterId];
        });
      }
    },
    clearMangaDetail: (state) => {
      state.manga = null;
      state.chapters = [];
      state.error = null;
    },
    clearErrors: (state) => {
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
        
        // Chỉ lưu cache nếu không phải từ cache
        if (!action.payload.fromCache) {
          if (action.payload.data?.data) {
            // Lưu vào cache
            const mangaId = action.payload.data.data[0]?.relationships.find(rel => rel.type === 'manga')?.id;
            if (mangaId) {
              state.cache.mangaChapters[mangaId] = action.payload.data.data;
            }
          }
        }
        
        if (action.payload.data?.data && Array.isArray(action.payload.data.data)) {
          state.chapters = action.payload.data.data;
        } else {
          state.chapters = [];
        }
      })
      .addCase(fetchMangaChapters.rejected, (state, action) => {
        state.loading = false;
        state.chapters = [];
        state.error = action.payload || 'Không thể lấy danh sách chapter';
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
      .addCase(getMangaDetailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Không reset manga state để tránh flash nội dung trắng
      })
      .addCase(getMangaDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        // Chỉ lưu cache nếu không phải từ cache
        if (!action.payload.fromCache) {
          if (action.payload.data) {
            // Lưu vào cache
            const mangaData = action.payload.data.data;
            if (mangaData) {
              state.cache.mangaDetails[mangaData.id] = action.payload.data;
            }
          }
        }
        
        if (action.payload.data?.data) {
          state.manga = action.payload.data.data;
        } else {
          state.manga = null;
          state.error = 'Không tìm thấy thông tin manga';
        }
      })
      .addCase(getMangaDetailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể lấy thông tin manga';
      })

      // Xử lý cleanupChapterCache
      .addCase(cleanupChapterCache.fulfilled, (state, action) => {
        const { chaptersToKeep } = action.payload;
        
        // Xóa các chapter cũ khỏi cache
        Object.keys(state.chapterPages).forEach(chapterId => {
          if (!chaptersToKeep.includes(chapterId)) {
            delete state.chapterPages[chapterId];
          }
        });
      });
  }
});

export const { clearError, clearOldCache, clearMangaDetail, clearErrors } = mangadexSlice.actions;
export default mangadexSlice.reducer;