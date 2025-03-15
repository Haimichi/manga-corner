import axiosClient from './axiosConfig';

const chapterApi = {
  getChaptersByMangaId: async (mangaId, params = {}) => {
    try {
      const response = await axiosClient.get(`/manga/${mangaId}/chapters`, { params });
      return response;
    } catch (error) {
      console.error(`Error fetching chapters for manga ${mangaId}:`, error);
      throw error;
    }
  },
  
  getChapterDetail: async (mangaId, chapterNumber) => {
    try {
      const response = await axiosClient.get(`/manga/${mangaId}/chapter/${chapterNumber}`);
      return response;
    } catch (error) {
      console.error(`Error fetching chapter detail:`, error);
      throw error;
    }
  },
  
  addChapter: async (mangaId, chapterData) => {
    try {
      const response = await axiosClient.post(`/manga/${mangaId}/chapters`, chapterData);
      return response;
    } catch (error) {
      console.error(`Error adding chapter:`, error);
      throw error;
    }
  },
  
  updateChapter: async (mangaId, chapterId, chapterData) => {
    try {
      const response = await axiosClient.patch(`/manga/${mangaId}/chapters/${chapterId}`, chapterData);
      return response;
    } catch (error) {
      console.error(`Error updating chapter:`, error);
      throw error;
    }
  },
  
  deleteChapter: async (mangaId, chapterId) => {
    try {
      const response = await axiosClient.delete(`/manga/${mangaId}/chapters/${chapterId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting chapter:`, error);
      throw error;
    }
  }
};

export default chapterApi;