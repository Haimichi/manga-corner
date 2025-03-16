import axios from 'axios';
import apiCache from '../../utils/apiCache';

// Sử dụng biến môi trường hoặc URL cố định
const API_URL = process.env.REACT_APP_API_URL || '';

// Tạo instance axios với baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API logger
api.interceptors.request.use(request => {
  console.log('Gửi request:', request.url, request.params);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Nhận response từ:', response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', { 
      message: error.message, 
      status: error.response?.status,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/**
 * API service cho manga
 */
const mangaApi = {
  /**
   * Lấy danh sách manga mới nhất
   */
  getLatest: async (params = {}) => {
    const cacheKey = `manga_latest_${JSON.stringify(params)}`;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData) {
      console.log('Sử dụng dữ liệu cache cho manga mới nhất');
      return cachedData;
    }

    try {
      console.log('Gọi API truyện mới với params:', params);
      
      const response = await api.get('/mangadex/latest', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 18
        } 
      });
      
      console.log('Kết quả API manga mới nhất:', response.data);
      
      apiCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy truyện mới:', error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách manga phổ biến
   */
  getPopular: async (params = {}) => {
    const cacheKey = `manga_popular_${JSON.stringify(params)}`;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData) {
      console.log('Sử dụng dữ liệu cache cho manga phổ biến');
      return cachedData;
    }

    try {
      console.log('Gọi API truyện phổ biến với params:', params);
      
      const response = await api.get('/mangadex/popular', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 18
        } 
      });
      
      console.log('Kết quả API manga phổ biến:', response.data);
      
      apiCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy manga phổ biến:', error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin chi tiết manga
   */
  getMangaDetails: async (id) => {
    try {
      if (!id) {
        throw new Error('ID manga không được để trống');
      }
      
      console.log(`Đang gọi API lấy thông tin manga ID: ${id}`);
      const response = await api.get(`/mangadex/manga/${id}`);
      console.log('Kết quả API thông tin manga:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi API lấy thông tin manga:', error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin chapter
   */
  getChapter: async (id) => {
    try {
      if (!id) {
        throw new Error('ID chapter không được để trống');
      }
      
      console.log(`Đang gọi API lấy chapter ID: ${id}`);
      const response = await api.get(`/mangadex/chapter/${id}`);
      console.log('Kết quả API thông tin chapter:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi API lấy thông tin chapter:', error);
      throw error;
    }
  },
  
  /**
   * Tìm kiếm manga
   */
  searchManga: async (query, params = {}) => {
    try {
      if (!query) {
        throw new Error('Từ khóa tìm kiếm không được để trống');
      }
      
      console.log(`Đang tìm kiếm manga với từ khóa: "${query}"`);
      const response = await api.get('/mangadex/search', { 
        params: {
          query: query,
          page: params.page || 1,
          limit: params.limit || 18
        } 
      });
      console.log('Kết quả tìm kiếm manga:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm manga:', error);
      throw error;
    }
  },
  
  getMangaById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID manga không hợp lệ');
      }
      
      console.log(`API - Đang lấy thông tin manga ${id}`);
      
      // Kiểm tra endpoint gọi đúng
      const response = await api.get(`/mangadex/manga/${id}`);
      
      console.log(`API - Nhận được response cho manga ${id}:`, 
        response?.data?.id ? 'Thành công' : 'Không có ID');
      
      return response;
    } catch (error) {
      console.error(`Lỗi khi tải thông tin manga ${id}:`, error);
      throw error;
    }
  },
  
  getChapters: async (mangaId, params = {}) => {
    try {
      if (!mangaId) {
        throw new Error('ID manga không hợp lệ');
      }
      
      console.log(`API - Đang lấy chapters cho manga ${mangaId}:`, params);
      
      // Loại bỏ tham số signal vì không thể serialize
      const { signal, ...validParams } = params;
      
      // Kiểm tra endpoint gọi đúng
      const response = await api.get(`/mangadex/manga/${mangaId}/chapters`, {
        params: validParams,
        signal
      });
      
      console.log(`API - Nhận được ${response?.data?.data?.length || 0} chapters cho manga ${mangaId}`);
      
      return response;
    } catch (error) {
      console.error(`Lỗi khi tải chapters cho manga ${mangaId}:`, error);
      throw error;
    }
  },
  
  getMyManga: async () => {
    try {
      const response = await api.get('/manga/my-manga');
      return response;
    } catch (error) {
      console.error('Error fetching my manga:', error);
      throw error;
    }
  },
  
  createManga: async (mangaData) => {
    try {
      const response = await api.post('/manga', mangaData);
      return response;
    } catch (error) {
      console.error('Error creating manga:', error);
      throw error;
    }
  },
  
  updateManga: async (id, mangaData) => {
    try {
      const response = await api.patch(`/manga/${id}`, mangaData);
      return response;
    } catch (error) {
      console.error(`Error updating manga ${id}:`, error);
      throw error;
    }
  },
  
  deleteManga: async (id) => {
    const response = await api.delete(`/manga/${id}`);
    return response;
  },
  
  getPendingManga: async () => {
    try {
      const response = await api.get('/manga/pending');
      return response;
    } catch (error) {
      console.error('Error fetching pending manga:', error);
      throw error;
    }
  },
  
  approveManga: async (id) => {
    try {
      const response = await api.patch(`/manga/${id}/approve`);
      return response;
    } catch (error) {
      console.error(`Error approving manga ${id}:`, error);
      throw error;
    }
  },
  
  rejectManga: async (id, data) => {
    try {
      const response = await api.patch(`/manga/${id}/reject`, data);
      return response;
    } catch (error) {
      console.error(`Error rejecting manga ${id}:`, error);
      throw error;
    }
  }
};

export default mangaApi; 