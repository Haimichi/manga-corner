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
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 18
      };

      console.log('Gọi API với params:', validParams);
      
      const response = await axiosClient.get('/mangadex/latest', { 
        params: validParams 
      });
      
      console.log('Response từ getLatest API:', {
        statusCode: response.status,
        dataLength: response?.data?.data?.length || 0,
        responseStructure: JSON.stringify(response.data).slice(0, 100) + '...'
      });
      
      apiCache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Lỗi khi tải manga mới nhất:', error);
      return {
        data: {
          data: [],
          total: 0
        }
      };
    }
  },
  
  getPopular: async (params = {}) => {
    try {
      const validParams = {
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 18,
        language: params.language || 'vi'
      };
      
      const response = await axiosClient.get('/mangadex/popular', { 
        params: validParams 
      });
      
      console.log('Response từ getPopular API:', {
        statusCode: response.status,
        dataLength: response?.data?.data?.length || 0,
        responseStructure: JSON.stringify(response.data).slice(0, 100) + '...'
      });
      
      return response;
    } catch (error) {
      console.error('Lỗi khi tải manga phổ biến:', error);
      return {
        data: {
          data: [],
          total: 0
        }
      };
    }
  },
  
  getMangaById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID manga không hợp lệ');
      }
      
      console.log(`API - Đang lấy thông tin manga ${id}`);
      
      // Kiểm tra endpoint gọi đúng
      const response = await axiosClient.get(`/mangadex/manga/${id}`);
      
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
      const response = await axiosClient.get(`/mangadex/manga/${mangaId}/chapters`, {
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