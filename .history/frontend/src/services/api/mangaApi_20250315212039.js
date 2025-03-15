import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const mangaApi = {
  getLatest: async (params) => {
    const response = await axios.get(`${API_URL}/manga/latest`, { params });
    return response;
  },
  
  getPopular: async (params) => {
    const response = await axios.get(`${API_URL}/manga/popular`, { params });
    return response;
  },
  
  getMangaDetail: async (id) => {
    const response = await axios.get(`${API_URL}/manga/${id}`);
    return response;
  },
  
  getChapters: async (mangaId, params) => {
    const response = await axios.get(`${API_URL}/manga/${mangaId}/chapters`, { params });
    return response;
  }
};

export default mangaApi; 