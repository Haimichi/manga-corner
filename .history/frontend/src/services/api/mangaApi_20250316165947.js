import axios from 'axios';
import apiCache from '../../utils/apiCache';

// Thay đổi URL API từ localhost:5000 thành URL tương đối
const API_URL = ''; // URL tương đối sẽ tự động sử dụng domain hiện tại

// Tạo instance axios với baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Theo dõi và xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', { 
      message: error.message, 
      status: error.response?.status,
      data: error.response?.data,
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
      
      // Thử gọi trực tiếp từ MangaDex API nếu backend không khả dụng
      const useDirectApi = params.useDirectApi || false;
      
      if (useDirectApi) {
        // Gọi trực tiếp từ MangaDex API
        const response = await axios.get('https://api.mangadex.org/manga', {
          params: {
            limit: params.limit || 18,
            offset: (params.page - 1) * (params.limit || 18) || 0,
            includes: ['cover_art', 'author', 'artist'],
            contentRating: ['safe', 'suggestive'],
            order: { updatedAt: 'desc' },
            availableTranslatedLanguage: ['vi', 'en'],
            hasAvailableChapters: true
          }
        });
        
        console.log('Kết quả từ MangaDex API:', response.data);
        return {
          data: response.data.data || [],
          pagination: {
            limit: params.limit || 18,
            offset: (params.page - 1) * (params.limit || 18) || 0,
            total: response.data.total || 0
          }
        };
      }
      
      // Gọi từ backend
      const response = await api.get('/api/mangadex/latest', { 
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
      
      // Thử gọi lại với API trực tiếp nếu chưa thử
      if (!params.useDirectApi) {
        console.log('Thử gọi trực tiếp từ MangaDex API...');
        return mangaApi.getLatest({ ...params, useDirectApi: true });
      }
      
      // Trả về dữ liệu trống nhưng không throw error để tránh crash
      return { 
        data: [], 
        pagination: { 
          limit: params.limit || 18, 
          offset: 0, 
          total: 0 
        },
        error: error.message 
      };
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
      
      // Thử gọi trực tiếp từ MangaDex API nếu backend không khả dụng
      const useDirectApi = params.useDirectApi || false;
      
      if (useDirectApi) {
        // Gọi trực tiếp từ MangaDex API
        const response = await axios.get('https://api.mangadex.org/manga', {
          params: {
            limit: params.limit || 18,
            offset: (params.page - 1) * (params.limit || 18) || 0,
            includes: ['cover_art', 'author', 'artist'],
            contentRating: ['safe', 'suggestive'],
            order: { followedCount: 'desc' },
            availableTranslatedLanguage: ['vi', 'en'],
            hasAvailableChapters: true
          }
        });
        
        console.log('Kết quả từ MangaDex API:', response.data);
        return {
          data: response.data.data || [],
          pagination: {
            limit: params.limit || 18,
            offset: (params.page - 1) * (params.limit || 18) || 0,
            total: response.data.total || 0
          }
        };
      }
      
      // Gọi từ backend
      const response = await api.get('/api/mangadex/popular', { 
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
      
      // Thử gọi lại với API trực tiếp nếu chưa thử
      if (!params.useDirectApi) {
        console.log('Thử gọi trực tiếp từ MangaDex API...');
        return mangaApi.getPopular({ ...params, useDirectApi: true });
      }
      
      // Trả về dữ liệu trống nhưng không throw error để tránh crash
      return { 
        data: [], 
        pagination: { 
          limit: params.limit || 18, 
          offset: 0, 
          total: 0 
        },
        error: error.message 
      };
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