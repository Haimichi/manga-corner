import api from './api';

export const getMangaChapters = async (mangaId, params = {}) => {
  try {
    console.log(`Gọi API chapters với mangaId=${mangaId}, params=`, params);
    const response = await api.get(`/mangadex/manga/${mangaId}/chapters`, { 
      params: {
        ...params
      }
    });
    console.log('Kết quả từ API chapters:', response);
    return response;
  } catch (error) {
    console.error('Lỗi gọi API chapters:', error);
    throw error;
  }
};