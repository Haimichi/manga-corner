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

// Thêm action để reset state chapters
export const resetChapters = createAction('mangadex/resetChapters');

// Thunk lấy chapters
export const fetchMangaChapters = createAsyncThunk(
  'mangadex/fetchChapters',
  async (mangaId, { rejectWithValue }) => {
    try {
      console.log('Redux: Bắt đầu fetch chapters cho manga:', mangaId);
      
      const timestamp = Date.now();
      const response = await getChapters(mangaId, {
        _t: timestamp
      });
      
      if (!response.data || !response.data.data) {
        console.warn('Redux: Dữ liệu trả về không hợp lệ:', response);
        return { data: [] };
      }
      
      console.log('Redux: Đã nhận được', response.data.data.length, 'chapters');
      return response.data;
    } catch (error) {
      console.error('Redux: Lỗi khi fetch chapters:', error);
      return rejectWithValue(error.message || 'Không thể tải danh sách chapter');
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
  async (mangaId, { rejectWithValue }) => {
    try {
      console.log('Fetching manga detail for ID:', mangaId);
      const response = await getMangaDetails(mangaId);
      
      // Xử lý dữ liệu để thêm URL ảnh bìa
      if (response.data?.data) {
        const manga = response.data.data;
        
        // Tìm cover art trong relationships
        const coverArt = manga.relationships?.find(rel => rel.type === 'cover_art');
        
        if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
          // Tạo URL đầy đủ cho ảnh bìa
          manga.coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverArt.attributes.fileName}`;
          console.log('Tạo URL ảnh bìa:', manga.coverUrl);
        }
      }
      
      console.log('Received manga detail:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching manga detail:', error);
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin manga');
    }
  }
);

const mangadexSlice = createSlice({
  name: 'mangadex',
  initialState: {
    latestManga: [],
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

      // Xử lý fetchMangaChapters
      .addCase(fetchMangaChapters.pending, (state) => {
        state.chaptersLoading = true;
        state.chaptersError = null;
      })
      .addCase(fetchMangaChapters.fulfilled, (state, action) => {
        state.chaptersLoading = false;
        // Đảm bảo data luôn hợp lệ
        if (action.payload && action.payload.data) {
          state.chapters = action.payload;
          console.log('Redux: State chapters đã cập nhật với', action.payload.data.length, 'chapters');
        } else {
          state.chapters = { data: [] };
          console.warn('Redux: Dữ liệu chapters không hợp lệ');
        }
      })
      .addCase(fetchMangaChapters.rejected, (state, action) => {
        state.chaptersLoading = false;
        state.chaptersError = action.payload || 'Lỗi không xác định';
        state.chapters = { data: [] };
        console.error('Redux: Lỗi khi lấy chapters:', action.payload);
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
      })
      .addCase(getMangaDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.manga = action.payload.data;
        console.log('Updated manga state:', state.manga);
      })
      .addCase(getMangaDetailAsync.rejected, (state, action) => {
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
      .addCase(resetChapters, (state) => {
        state.chapters = { data: [] };
        state.chaptersLoading = false;
        state.chaptersError = null;
        console.log('Redux: State chapters đã được reset');
      });
  }
});

export const { clearError, clearOldCache, clearMangaDetail, clearErrors } = mangadexSlice.actions;
export default mangadexSlice.reducer;