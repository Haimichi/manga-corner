import api from './api';
import axiosClient from './axiosClient';

// Lấy manga mới cập nhật từ MangaDex
export const getLatestManga = async (limit = 12) => {
  try {
    const response = await api.get('/mangadex/search', {
      params: { 
        limit, 
        sort: 'latestUploadedChapter',
        order: 'desc',
        language: 'vi'
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
    const response = await api.get('/mangadex/search', {
      params: { 
        limit, 
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

export const getChapters = async (mangaId, params = {}) => {
  try {
    // Thêm timestamp để luôn nhận dữ liệu mới
    const timestamp = Date.now();
    console.log(`Đang lấy chapters cho manga ${mangaId} tại thời điểm ${new Date(timestamp).toLocaleTimeString()}`);
    
    const response = await axiosClient.get(`/mangadex/manga/${mangaId}/chapters`, {
      params: {
        ...params,
        limit: 100,
        offset: 0,
        translatedLanguage: ['vi', 'en'],
        timestamp // Thêm timestamp để bypass cache
      },
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
    });
    
    console.log(`Nhận được ${response.data?.data?.length || 0} chapters cho manga ${mangaId}`);
    return response;
  } catch (error) {
    console.error(`Lỗi khi lấy chapters:`, error);
    throw error;
  }
}