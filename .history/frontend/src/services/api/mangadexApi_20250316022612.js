import axiosClient from './axiosClient';

// Lấy danh sách manga mới nhất
export const getLatestManga = async (params = {}) => {
  try {
    const response = await axiosClient.get('/mangadex/manga/latest', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy manga mới:', error);
    throw error;
  }
};

// Lấy danh sách manga phổ biến
export const getPopularManga = async (params = {}) => {
  try {
    const response = await axiosClient.get('/mangadex/manga/popular', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy manga phổ biến:', error);
    throw error;
  }
};

// Tìm kiếm manga
export const searchManga = async (query, params = {}) => {
  try {
    const response = await axiosClient.get('/mangadex/manga/search', {
      params: { ...params, q: query }
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
    const response = await axiosClient.get(`/mangadex/manga/${mangaId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết manga:', error);
    throw error;
  }
};

// Lấy danh sách chapter
export const getChapters = async (mangaId, customParams = {}) => {
  try {
    const timestamp = Date.now();
    const params = {
      ...customParams,
      limit: customParams.limit || 100,
      offset: customParams.offset || 0,
      translatedLanguage: customParams.translatedLanguage || ['vi', 'en'],
      _t: timestamp
    };
    
    const response = await axiosClient.get(`/mangadex/manga/${mangaId}/chapters`, {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    return response;
  } catch (error) {
    console.error(`Lỗi khi lấy chapters cho manga ${mangaId}:`, error);
    throw error;
  }
};

// Tạo đối tượng API để export
const mangadexApi = {
  getLatestManga,
  getPopularManga,
  searchManga,
  getMangaDetails,
  getChapters
};

export default mangadexApi;