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
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    const response = await axiosClient.get(
      `/mangadex/manga/${mangaId}/chapters`, 
      { 
        params: {
          ...params,
          _: timestamp // Thêm parameter ngẫu nhiên để tránh cache
        } 
      }
    );
    
    console.log(`Response chapters (status ${response.status}):`, response.data);
    
    // Với response 304, kiểm tra xem có dữ liệu cached không
    if (response.status === 304) {
      console.log('Dùng dữ liệu cache cho chapters');
      // Đảm bảo có dữ liệu, ngay cả khi là cached
      if (!response.data || !response.data.data) {
        return { data: { data: [] } };
      }
    }
    
    return response;
  } catch (error) {
    console.error(`Lỗi khi lấy chapters cho manga ${mangaId}:`, error);
    throw error;
  }
}