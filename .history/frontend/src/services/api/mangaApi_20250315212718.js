import axiosClient from './axiosConfig';

const mangaApi = {
  getLatest: async (params) => {
    const response = await axiosClient.get('/manga/latest', { params });
    return response;
  },
  
  getPopular: async (params) => {
    const response = await axiosClient.get('/manga/popular', { params });
    return response;
  },
  
  getMangaDetail: async (id) => {
    const response = await axiosClient.get(`/manga/${id}`);
    return response;
  },
  
  getChapters: async (mangaId, params) => {
    const response = await axiosClient.get(`/manga/${mangaId}/chapters`, { params });
    return response;
  }
};

export default mangaApi; 