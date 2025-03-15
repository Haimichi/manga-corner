import api from './api';
import { getImageUrl } from '../utils/imageHelper';

// Thêm timeout và retry
const TIMEOUT = 10000; // 10 giây
const MAX_RETRIES = 2;

// Hàm retry helper
const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Thử lại API (còn ${retries} lần)...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return retryRequest(fn, retries - 1);
  }
};

export const getHomeMangas = async (params = {}) => {
  try {
    return await retryRequest(async () => {
      const response = await api.get('/mangadex/manga', { 
        params,
        timeout: TIMEOUT
      });
      return response;
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách manga:', error);
    throw error;
  }
};

export const getMangaDetail = async (mangaId) => {
  try {
    return await retryRequest(async () => {
      // Tải song song chi tiết manga và ảnh bìa
      const [mangaResponse, coverResponse] = await Promise.all([
        api.get(`/mangadex/manga/${mangaId}`, { timeout: TIMEOUT }),
        api.get(`/mangadex/manga/${mangaId}/cover`, { timeout: TIMEOUT })
      ]);
      
      // Thêm URL ảnh bìa vào dữ liệu manga
      if (mangaResponse.data?.data && coverResponse.data?.data) {
        const coverFileName = coverResponse.data.data.attributes.fileName;
        mangaResponse.data.data.coverUrl = getImageUrl(mangaId, coverFileName);
      }
      
      return mangaResponse;
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin manga:', error);
    throw error;
  }
};

export const getMangaChapters = async (mangaId, params = {}) => {
  try {
    return await retryRequest(async () => {
      console.log(`Đang lấy chapters cho manga ${mangaId} với params:`, params);
      const response = await api.get(`/mangadex/manga/${mangaId}/chapters`, { 
        params,
        timeout: TIMEOUT
      });
      return response;
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chapter:', error);
    throw error;
  }
};

export const getChapterImages = async (chapterId) => {
  try {
    return await retryRequest(async () => {
      const response = await api.get(`/mangadex/chapter/${chapterId}/images`, {
        timeout: TIMEOUT
      });
      return response;
    });
  } catch (error) {
    console.error('Lỗi khi lấy hình ảnh chapter:', error);
    throw error;
  }
};