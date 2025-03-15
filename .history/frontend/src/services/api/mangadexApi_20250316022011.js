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

export const getChapters = async (mangaId, customParams = {}) => {
  try {
    // Thêm timestamp để luôn nhận dữ liệu mới
    const timestamp = Date.now();
    
    // Log thông tin request để debug
    console.log(`Frontend: Đang lấy chapters cho manga ${mangaId} tại ${new Date().toLocaleTimeString()}`);
    
    // Chuẩn bị params
    const params = {
      ...customParams,
      limit: customParams.limit || 100,
      offset: customParams.offset || 0,
      translatedLanguage: customParams.translatedLanguage || ['vi', 'en'],
      _t: timestamp // Thêm timestamp để bypass cache
    };
    
    // Gọi API với headers chống cache
    const response = await axiosClient.get(`/mangadex/manga/${mangaId}/chapters`, {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // Log response
    console.log(`Frontend: Nhận được ${response?.data?.data?.length || 0} chapters cho manga ${mangaId}`);
    
    return response;
  } catch (error) {
    console.error(`Frontend: Lỗi khi lấy chapters cho manga ${mangaId}:`, error);
    throw error;
  }
}