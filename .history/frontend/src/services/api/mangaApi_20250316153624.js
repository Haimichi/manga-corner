import axiosClient from './axiosConfig';
import apiCache from '../../utils/apiCache';

const mangaApi = {
  getLatest: async (params = {}) => {
    const cacheKey = `manga_latest_${JSON.stringify(params)}`;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData) {
      console.log('Sử dụng dữ liệu cache cho manga mới nhất');
      return cachedData;
    }

    try {
      const validParams = {
        page: isNaN(parseInt(params.page)) ? 1 : parseInt(params.page),
        limit: isNaN(parseInt(params.limit)) ? 18 : parseInt(params.limit)
      };

      console.log('Gọi API với params:', validParams);
      
      const response = await axiosClient.get('/mangadex/latest', { 
        params: validParams 
      });
      
      apiCache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Lỗi khi tải manga mới nhất:', error);
      return {
        data: {
          data: [],
          message: error.message || 'Đã xảy ra lỗi khi tải dữ liệu'
        }
      };
    }
  },
  
  getPopular: async (params = {}) => {
    try {
      const validParams = {
        page: isNaN(parseInt(params.page)) ? 1 : parseInt(params.page),
        limit: isNaN(parseInt(params.limit)) ? 18 : parseInt(params.limit),
        language: params.language || 'vi'
      };
      
      const response = await axiosClient.get('/mangadex/popular', { 
        params: validParams 
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi tải manga phổ biến:', error);
      return {
        data: {
          data: [],
          message: error.message || 'Đã xảy ra lỗi khi tải dữ liệu'
        }
      };
    }
  },
  
  getMangaById: async (id) => {
    try {
      const response = await axiosClient.get(`/manga/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching manga ${id}:`, error);
      throw error;
    }
  },
  
  getChapters: async (mangaId, params) => {
    const response = await axiosClient.get(`/manga/${mangaId}/chapters`, { params });
    return response;
  },
  
  getMyManga: async () => {
    try {
      const response = await axiosClient.get('/manga/my-manga');
      return response;
    } catch (error) {
      console.error('Error fetching my manga:', error);
      throw error;
    }
  },
  
  createManga: async (mangaData) => {
    try {
      const response = await axiosClient.post('/manga', mangaData);
      return response;
    } catch (error) {
      console.error('Error creating manga:', error);
      throw error;
    }
  },
  
  updateManga: async (id, mangaData) => {
    try {
      const response = await axiosClient.patch(`/manga/${id}`, mangaData);
      return response;
    } catch (error) {
      console.error(`Error updating manga ${id}:`, error);
      throw error;
    }
  },
  
  deleteManga: async (id) => {
    const response = await axiosClient.delete(`/manga/${id}`);
    return response;
  },
  
  getPendingManga: async () => {
    try {
      const response = await axiosClient.get('/manga/pending');
      return response;
    } catch (error) {
      console.error('Error fetching pending manga:', error);
      throw error;
    }
  },
  
  approveManga: async (id) => {
    try {
      const response = await axiosClient.patch(`/manga/${id}/approve`);
      return response;
    } catch (error) {
      console.error(`Error approving manga ${id}:`, error);
      throw error;
    }
  },
  
  rejectManga: async (id, data) => {
    try {
      const response = await axiosClient.patch(`/manga/${id}/reject`, data);
      return response;
    } catch (error) {
      console.error(`Error rejecting manga ${id}:`, error);
      throw error;
    }
  },
  
  searchManga: async (query) => {
    try {
      const response = await axiosClient.get('/manga/search', { params: query });
      return response;
    } catch (error) {
      console.error('Error searching manga:', error);
      throw error;
    }
  }
};

export default mangaApi; 