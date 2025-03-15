import api from './api';

// Lấy danh sách manga mới nhất với phân trang
export const getLatestManga = async (params) => {
  try {
    const response = await api.get('/mangadex/search', { params });
    console.log("API getLatestManga response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API getLatestManga:', error);
    // Trả về cấu trúc mặc định để tránh lỗi
    return {
      status: 'error',
      data: { data: [] },
      pagination: { limit: 12, offset: 0, total: 0 },
      error: error.message
    };
  }
};

// Lấy danh sách manga phổ biến với phân trang
export const getPopularManga = async (page = 1, limit = 12) => {
  try {
    const offset = (page - 1) * limit;
    const response = await api.get('/mangadex/search', {
      params: {
        limit,
        offset,
        sort: 'followedCount',
        order: 'desc',
        language: 'vi'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy manga phổ biến:', error);
    throw error;
  }
};

// Tìm kiếm manga
export const searchManga = async (query, limit = 30) => {
  try {
    const response = await api.get('/mangadex/search', {
      params: { q: query, limit, language: 'vi' }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm manga:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết của manga
export const getMangaDetails = async (mangaId) => {
  try {
    console.log("Gọi API getMangaDetails với ID:", mangaId);
    // Kiểm tra mangaId
    if (!mangaId || mangaId === 'undefined') {
      throw new Error('ID manga không hợp lệ');
    }
    
    const response = await api.get(`/mangadex/manga/${mangaId}`);
    console.log("API getMangaDetails response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API getMangaDetails:', error);
    throw error;
  }
};

// Lấy danh sách chapter của manga
export const getMangaChapters = async (mangaId, params) => {
  try {
    console.log("Gọi API getMangaChapters với ID:", mangaId);
    // Kiểm tra mangaId
    if (!mangaId || mangaId === 'undefined') {
      throw new Error('ID manga không hợp lệ');
    }
    
    const response = await api.get(`/mangadex/manga/${mangaId}/chapters`, { params });
    console.log("API getMangaChapters response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API getMangaChapters:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết của chapter
export const getChapterDetails = async (chapterId) => {
  try {
    const response = await api.get(`/mangadex/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin chapter ${chapterId}:`, error);
    throw error;
  }
};

// Lấy các trang của chapter
export const getChapterPages = async (chapterId) => {
  try {
    const response = await api.get(`/mangadex/chapter/${chapterId}/pages`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy trang của chapter ${chapterId}:`, error);
    throw error;
  }
};

// Thêm default export
const mangadexApi = {
  getLatestManga,
  getPopularManga,
  getMangaDetails,
  getMangaChapters,
  searchManga,
  getChapterDetails,
  getChapterPages
};

export default mangadexApi; 