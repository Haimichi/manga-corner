import api from './api';

// Lấy danh sách manga mới nhất với phân trang
export const getLatestManga = async (params) => {
  try {
    // Đảm bảo tham số sắp xếp được truyền đúng
    const requestParams = {
      ...params,
      sort: 'updatedAt', // Sử dụng updatedAt thay vì latestUploadedChapter
      order: 'desc'
    };
    
    console.log("Gọi API truyện mới với params:", requestParams);
    const response = await api.get('/mangadex/search', { params: requestParams });
    console.log("Response truyện mới:", response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy truyện mới:', error);
    throw error;
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
        language: 'vi',
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
    console.log(`Gọi API lấy chi tiết manga ${mangaId}`);
    const response = await api.get(`/mangadex/manga/${mangaId}`, {
      params: {
        'includes[]': ['cover_art', 'author', 'artist']
      }
    });
    console.log('Kết quả API:', response);
    return response;
  } catch (error) {
    console.error('Lỗi API getMangaDetails:', error);
    throw error;
  }
};

// Lấy danh sách chapter của manga
export const getMangaChapters = async (mangaId, params = {}) => {
  try {
    console.log(`Gọi API lấy chapter cho manga ${mangaId}`);
    
    // Sử dụng tham số đơn giản hơn
    const requestParams = {
      limit: 30,
      offset: 0,
      // Không chỉ định ngôn ngữ để lấy tất cả chapters
      ...params
    };
    
    const response = await api.get(`/mangadex/manga/${mangaId}/chapters`, { params: requestParams });
    console.log("Kết quả API chapters:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi gọi API getMangaChapters:`, error);
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