import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import {
  getLatestManga,
  getPopularManga,
  getMangaChapters,
  getChapterDetails,
  getChapterPages,
  getMangaDetails
} from '../../services/mangadexApi';
import mangadexApi, { getChapters } from '../../services/api/mangadexApi';
import axios from 'axios';
import api from '../../services/api';
import mangaApi from '../../services/api/mangaApi';

// Định nghĩa API_BASE_URL
const API_BASE_URL = 'https://api.mangadex.org';

// Thunk action để lấy manga mới nhất
export const fetchLatestManga = createAsyncThunk(
  'mangadex/fetchLatestManga',
  async (params, { rejectWithValue }) => {
    try {
      console.log('Thunk fetchLatestManga - Params:', params);
      
      const response = await mangaApi.getLatest(params);
      console.log('Thunk fetchLatestManga - Response:', response);
      
      return response;
    } catch (error) {
      console.error('Thunk fetchLatestManga - Error:', error);
      return rejectWithValue(error.message || 'Không thể lấy manga mới nhất');
    }
  }
);

// Thunk action để lấy manga phổ biến
export const fetchPopularManga = createAsyncThunk(
  'mangadex/fetchPopularManga',
  async (params, { rejectWithValue }) => {
    try {
      console.log('Thunk fetchPopularManga - Params:', params);
      
      const response = await mangaApi.getPopular(params);
      console.log('Thunk fetchPopularManga - Response:', response);
      
      return response;
    } catch (error) {
      console.error('Thunk fetchPopularManga - Error:', error);
      return rejectWithValue(error.message || 'Không thể lấy manga phổ biến');
    }
  }
);

// Thêm action để reset state chapters
export const resetChapters = createAsyncThunk(
  'mangadex/resetChapters',
  async () => {
    return { data: [] };
  }
);

// Thunk lấy chapters
export const fetchMangaChapters = createAsyncThunk(
  'mangadex/fetchChapters',
  async (mangaId, { rejectWithValue }) => {
    try {
      const allChapters = [];
      let offset = 0;
      const limit = 100; // API thường giới hạn 100 kết quả mỗi request
      let hasMore = true;
      
      // Lặp cho đến khi không còn chapter nào
      while (hasMore) {
        const response = await axios.get(
          `${API_BASE_URL}/manga/${mangaId}/feed`,
          {
            params: {
              limit: limit,
              offset: offset,
              includes: ['scanlation_group', 'user'],
              order: { chapter: 'desc' },
              contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
              translatedLanguage: ['en', 'vi'] // Chỉ lấy tiếng Anh và tiếng Việt
            },
            headers: {
              'Content-Type': 'application/json',
              // Thêm header để tránh cache
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );
        
        // Thêm chapter từ response hiện tại vào mảng
        if (response.data.data && response.data.data.length > 0) {
          allChapters.push(...response.data.data);
          
          // Nếu số lượng ít hơn limit, chúng ta đã lấy tất cả
          if (response.data.data.length < limit) {
            hasMore = false;
          } else {
            // Tăng offset cho request tiếp theo
            offset += limit;
          }
        } else {
          hasMore = false;
        }
      }
      
      // Trả về tất cả chapter đã lấy được
      return {
        data: allChapters,
        limit: allChapters.length,
        offset: 0,
        total: allChapters.length
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
export const fetchMangaDetails = createAsyncThunk(
  'mangadex/fetchMangaDetails',
  async (mangaId, { rejectWithValue }) => {
    try {
      // Kiểm tra mangaId trước khi gọi API
      if (!mangaId || mangaId === 'undefined') {
        return rejectWithValue('ID manga không hợp lệ');
      }
      
      const response = await api.get(`/mangadex/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const mangadexSlice = createSlice({
  name: 'mangadex',
  initialState: {
    latest: [],
    popularManga: [],
    chapters: { data: [] },
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
    },
    chaptersLoading: false,
    chaptersError: null
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
      state.chapters = { data: [] };
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
        
        try {
          if (action.payload && action.payload.data) {
            state.latest = action.payload.data;
            console.log(`Cập nhật state.latest với ${state.latest.length} manga`);
          } else {
            console.error('Cấu trúc dữ liệu không hợp lệ trong fetchLatestManga', action.payload);
            state.latest = [];
            state.error = 'Cấu trúc dữ liệu không hợp lệ';
          }
        } catch (error) {
          console.error('Lỗi khi xử lý dữ liệu manga mới nhất', error);
          state.latest = [];
          state.error = 'Lỗi khi xử lý dữ liệu';
        }
      })
      .addCase(fetchLatestManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải manga mới nhất';
        state.latest = [];
      })

      // Xử lý manga phổ biến
      .addCase(fetchPopularManga.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularManga.fulfilled, (state, action) => {
        state.loading = false;
        
        try {
          if (action.payload && action.payload.data) {
            state.popularManga = action.payload.data;
            console.log(`Cập nhật state.popularManga với ${state.popularManga.length} manga`);
          } else {
            console.error('Cấu trúc dữ liệu không hợp lệ trong fetchPopularManga', action.payload);
            state.popularManga = [];
            state.error = 'Cấu trúc dữ liệu không hợp lệ';
          }
        } catch (error) {
          console.error('Lỗi khi xử lý dữ liệu manga phổ biến', error);
          state.popularManga = [];
          state.error = 'Lỗi khi xử lý dữ liệu';
        }
      })
      .addCase(fetchPopularManga.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải manga phổ biến';
        state.popularManga = [];
      })

      // Xử lý fetchMangaChapters
      .addCase(fetchMangaChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMangaChapters.fulfilled, (state, action) => {
        state.chapters = action.payload;
        state.loading = false;
      })
      .addCase(fetchMangaChapters.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
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
      .addCase(fetchMangaDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMangaDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.manga = action.payload.data;
        console.log('Updated manga state:', state.manga);
      })
      .addCase(fetchMangaDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi không xác định';
        console.error('Reducer error:', state.error);
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
      })

      // Xử lý resetChapters
      .addCase(resetChapters.fulfilled, (state) => {
        state.chapters = { data: [] };
        state.loading = false;
        state.error = null;
      });
  }
});

export const { clearError, clearOldCache, clearMangaDetail, clearErrors } = mangadexSlice.actions;
export default mangadexSlice.reducer;