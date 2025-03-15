import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chapterApi from '../../services/api/chapterApi';

const initialState = {
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null
};

export const getChaptersByMangaId = createAsyncThunk(
  'chapter/getChaptersByMangaId',
  async (mangaId, { rejectWithValue }) => {
    try {
      const response = await chapterApi.getChaptersByMangaId(mangaId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải danh sách chapter' });
    }
  }
);

export const getChapterDetail = createAsyncThunk(
  'chapter/getChapterDetail',
  async ({ mangaId, chapterNumber }, { rejectWithValue }) => {
    try {
      const response = await chapterApi.getChapterDetail(mangaId, chapterNumber);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải chi tiết chapter' });
    }
  }
);

const chapterSlice = createSlice({
  name: 'chapter',
  initialState,
  reducers: {
    clearChapterError: (state) => {
      state.error = null;
    },
    clearCurrentChapter: (state) => {
      state.currentChapter = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getChaptersByMangaId
      .addCase(getChaptersByMangaId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChaptersByMangaId.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = action.payload?.data || [];
      })
      .addCase(getChaptersByMangaId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Lỗi khi tải danh sách chapter';
      })
      
      // getChapterDetail
      .addCase(getChapterDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChapterDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChapter = action.payload?.data || null;
      })
      .addCase(getChapterDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Lỗi khi tải chi tiết chapter';
      });
  }
});

export const { clearChapterError, clearCurrentChapter } = chapterSlice.actions;
export default chapterSlice.reducer;