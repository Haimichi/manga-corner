const axios = require('axios');
const cacheService = require('./cacheService');
const config = require('../config/config');

const MANGADEX_API = config.MANGADEX_API;

const MangadexService = {
  constructor() {
    this.api = axios.create({
      baseURL: MANGADEX_API,
      timeout: 10000
    });
  },

  async getLatestUpdates(limit = 20, offset = 0) {
    const cacheKey = `latest:${limit}:${offset}`;
    let data = await cacheService.get(cacheKey);

    if (!data) {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          order: { updatedAt: 'desc' },
          includes: ['cover_art', 'author', 'artist'],
          contentRating: ['safe', 'suggestive'],
          hasAvailableChapters: true
        }
      });
      data = response.data;
      await cacheService.set(cacheKey, data, 300); // cache 5 phút
    }

    return data;
  },

  async getPopularManga(limit = 20, offset = 0) {
    const cacheKey = `popular:${limit}:${offset}`;
    let data = await cacheService.get(cacheKey);

    if (!data) {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          order: { followedCount: 'desc' },
          includes: ['cover_art', 'author', 'artist'],
          contentRating: ['safe', 'suggestive']
        }
      });
      data = response.data;
      await cacheService.set(cacheKey, data, 3600); // cache 1 giờ
    }

    return data;
  },

  async getMangaDetails(mangaId) {
    const cacheKey = `manga:${mangaId}`;
    let data = await cacheService.get(cacheKey);

    if (!data) {
      const response = await this.api.get(`/manga/${mangaId}`, {
        params: {
          includes: ['cover_art', 'author', 'artist', 'tag']
        }
      });
      data = response.data;
      await cacheService.set(cacheKey, data, 3600); // cache 1 giờ
    }

    return data;
  },

  async getChapterList(mangaId, limit = 100, offset = 0) {
    const cacheKey = `chapters:${mangaId}:${limit}:${offset}`;
    let data = await cacheService.get(cacheKey);

    if (!data) {
      const response = await this.api.get(`/manga/${mangaId}/feed`, {
        params: {
          limit,
          offset,
          translatedLanguage: ['en', 'vi'],
          order: { chapter: 'desc' },
          includes: ['scanlation_group']
        }
      });
      data = response.data;
      await cacheService.set(cacheKey, data, 1800); // cache 30 phút
    }

    return data;
  },

  async getChapterPages(chapterId) {
    const response = await this.api.get(`/at-home/server/${chapterId}`);
    return response.data;
  },

  async getLatestManga(limit = 20, offset = 0) {
    try {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          order: { updatedAt: 'desc' },
          includes: ['cover_art']
        }
      });
      return response.data;
    } catch (error) {
      console.error('MangaDex API Error:', error);
      throw error;
    }
  },

  async getPopularManga(limit = 20, offset = 0) {
    try {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          order: { followedCount: 'desc' },
          includes: ['cover_art']
        }
      });
      return response.data;
    } catch (error) {
      console.error('MangaDex API Error:', error);
      throw error;
    }
  },

  // Tìm kiếm manga từ MangaDex
  async searchManga(query, limit = 10, offset = 0, language = 'vi') {
    const cacheKey = `mangadex:search:${query}:${limit}:${offset}:${language}`;
    
    // Kiểm tra cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log('Lấy kết quả tìm kiếm từ cache');
      return cachedData;
    }
    
    try {
      console.log(`Tìm kiếm manga "${query}" từ MangaDex API`);
      
      const response = await axios.get(`${MANGADEX_API}/manga`, {
        params: {
          title: query,
          limit,
          offset,
          availableTranslatedLanguage: [language],
          includes: ['cover_art', 'author', 'artist']
        }
      });
      
      // Cache kết quả trong 10 phút
      await cacheService.set(cacheKey, response.data, 600);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm manga từ MangaDex:', error.message);
      throw error;
    }
  },
  
  // Lấy chi tiết manga từ MangaDex
  async getMangaDetails(mangaId) {
    const cacheKey = `mangadex:manga:${mangaId}`;
    
    // Kiểm tra cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log('Lấy chi tiết manga từ cache');
      return cachedData;
    }
    
    try {
      console.log(`Lấy chi tiết manga ID: ${mangaId} từ MangaDex API`);
      
      const response = await axios.get(`${MANGADEX_API}/manga/${mangaId}`, {
        params: {
          includes: ['cover_art', 'author', 'artist']
        }
      });
      
      // Cache kết quả trong 1 giờ
      await cacheService.set(cacheKey, response.data, 3600);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết manga từ MangaDex:', error.message);
      throw error;
    }
  },
  
  // Lấy danh sách chapter từ MangaDex
  async getMangaChapters(mangaId, limit = 30, offset = 0, language = 'vi') {
    const cacheKey = `mangadex:chapters:${mangaId}:${limit}:${offset}:${language}`;
    
    // Kiểm tra cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log('Lấy danh sách chapter từ cache');
      return cachedData;
    }
    
    try {
      console.log(`Lấy chapters của manga ID: ${mangaId} từ MangaDex API`);
      
      const response = await axios.get(`${MANGADEX_API}/manga/${mangaId}/feed`, {
        params: {
          limit,
          offset,
          translatedLanguage: [language],
          order: { chapter: 'desc' }
        }
      });
      
      // Cache kết quả trong 15 phút
      await cacheService.set(cacheKey, response.data, 900);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chapter từ MangaDex:', error.message);
      throw error;
    }
  },
  
  // Lấy nội dung chapter từ MangaDex
  async getChapterContent(chapterId) {
    const cacheKey = `mangadex:chapter:${chapterId}`;
    
    // Kiểm tra cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log('Lấy nội dung chapter từ cache');
      return cachedData;
    }
    
    try {
      console.log(`Lấy nội dung chapter ID: ${chapterId} từ MangaDex API`);
      
      // 1. Lấy thông tin chapter
      const chapterResponse = await axios.get(`${MANGADEX_API}/chapter/${chapterId}`);
      
      // 2. Lấy server và danh sách hình ảnh
      const serverResponse = await axios.get(`${MANGADEX_API}/at-home/server/${chapterId}`);
      
      const result = {
        chapter: chapterResponse.data.data,
        images: serverResponse.data
      };
      
      // Cache kết quả trong 1 giờ
      await cacheService.set(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy nội dung chapter từ MangaDex:', error.message);
      throw error;
    }
  }
};

module.exports = MangadexService;