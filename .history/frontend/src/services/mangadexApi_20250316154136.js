import api from './api';
import { getImageUrl } from '../utils/imageHelper';

// Thêm timeout và retry
const TIMEOUT = 10000; // 10 giây
const MAX_RETRIES = 2;

// Hàm retry helper
const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Thử lại API (còn ${retries} lần)...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return retryRequest(fn, retries - 1);
  }
};

// Lấy danh sách manga mới nhất với phân trang
export const getLatestManga = async (params) => {
  try {
    // Đảm bảo tham số sắp xếp được truyền đúng
    const requestParams = {
      ...params,
      sort: 'updatedAt',
      order: 'desc'
    };
    
    console.log("Gọi API truyện mới với params:", requestParams);
    const response = await api.get('/api/mangadex/latest', { params: requestParams });
    console.log("Response truyện mới:", response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy truyện mới:', error);
    // Trả về đối tượng rỗng có cấu trúc giống response thành công
    return {
      data: [], 
      limit: params.limit || 18,
      offset: params.offset || 0,
      total: 0
    };
  }
};

// Lấy danh sách manga phổ biến với phân trang
export const getPopularManga = async (page = 1, limit = 12) => {
  try {
    const offset = (page - 1) * limit;
    const response = await api.get('/api/mangadex/popular', {
      params: {
        limit,
        offset,
        language: 'vi',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy manga phổ biến:', error);
    // Trả về đối tượng rỗng có cấu trúc giống response thành công
    return {
      data: [],
      limit: limit,
      offset: offset,
      total: 0
    };
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
    const response = await api.get(`/api/mangadex/manga/${mangaId}`, {
      params: {
        'includes[]': ['cover_art', 'author', 'artist']
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết manga:', error);
    throw error;
  }
};

// Lấy danh sách chapter của manga
export const getMangaChapters = async (mangaId, params = {}) => {
  try {
    return await retryRequest(async () => {
      console.log(`Đang lấy chapters cho manga ${mangaId} với params:`, params);
      const response = await api.get(`/mangadex/manga/${mangaId}/chapters`, { 
        params,
        timeout: TIMEOUT
      });
      return response;
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chapter:', error);
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