import api from './api';

// Lấy manga mới cập nhật từ MangaDex
export const getLatestManga = async (limit = 12) => {
  try {
    const response = await api.get('/mangadex/vietnamese', {
      params: { 
        limit, 
        offset: 0,
        sort: 'latestUploadedChapter',
        order: 'desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy manga mới:', error);
    throw error;
  }
};

// Lấy manga phổ biến từ MangaDex
export const getPopularManga = async (limit = 12) => {
  try {
    const response = await api.get('/mangadex/vietnamese', {
      params: { 
        limit, 
        offset: 0,
        sort: 'followedCount',
        order: 'desc'
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

// Lấy chi tiết manga
export const getMangaDetails = async (mangaId) => {
  try {
    const response = await api.get(`/mangadex/manga/${mangaId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết manga:', error);
    throw error;
  }
};