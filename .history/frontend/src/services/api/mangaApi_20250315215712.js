import axiosClient from './axiosConfig';

const mangaApi = {
  getLatest: async (params = {}) => {
    try {
      const response = await axiosClient.get('/manga/latest', { params });
      return response;
    } catch (error) {
      console.error('Error fetching latest manga:', error);
      throw error;
    }
  },
  
  getPopular: async (params = {}) => {
    try {
      const response = await axiosClient.get('/manga/popular', { params });
      return response;
    } catch (error) {
      console.error('Error fetching popular manga:', error);
      throw error;
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