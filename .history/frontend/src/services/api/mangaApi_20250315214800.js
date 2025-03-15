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
    const response = await axiosClient.get('/manga/my-manga');
    return response;
  },
  
  createManga: async (mangaData) => {
    const response = await axiosClient.post('/manga', mangaData);
    return response;
  },
  
  updateManga: async (id, mangaData) => {
    const response = await axiosClient.patch(`/manga/${id}`, mangaData);
    return response;
  },
  
  deleteManga: async (id) => {
    const response = await axiosClient.delete(`/manga/${id}`);
    return response;
  },
  
  getPendingManga: async () => {
    const response = await axiosClient.get('/manga/pending');
    return response;
  },
  
  approveManga: async (id) => {
    const response = await axiosClient.patch(`/manga/${id}/approve`);
    return response;
  },
  
  rejectManga: async (id) => {
    const response = await axiosClient.patch(`/manga/${id}/reject`);
    return response;
  }
};

export default mangaApi; 