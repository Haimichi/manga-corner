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
  },

  // Hàm mới để lấy tất cả manga tiếng Việt
  async getAllVietnameseManga(limit = 100) {
    try {
      console.log('Bắt đầu lấy tất cả manga tiếng Việt từ MangaDex');
      
      const allManga = [];
      let offset = 0;
      let hasMoreData = true;
      let total = 0;
      
      // Cache key cho tổng số manga
      const countCacheKey = 'mangadex:vi-manga:count';
      const cachedCount = await cacheService.get(countCacheKey);
      
      // Lặp cho đến khi lấy hết dữ liệu
      while (hasMoreData) {
        console.log(`Đang lấy manga từ offset ${offset}, limit ${limit}`);
        
        // Cache key cho mỗi trang
        const pageCacheKey = `mangadex:vi-manga:${offset}:${limit}`;
        let pageData = await cacheService.get(pageCacheKey);
        
        if (!pageData) {
          // Nếu không có cache, gọi API
          const response = await axios.get(`${MANGADEX_API}/manga`, {
            params: {
              limit,
              offset,
              availableTranslatedLanguage: ['vi'],
              includes: ['cover_art', 'author', 'artist'],
              contentRating: ['safe', 'suggestive', 'erotica'], // Thêm filter theo nội dung nếu cần
              order: { updatedAt: 'desc' } // Sắp xếp theo ngày cập nhật mới nhất
            }
          });
          
          pageData = response.data;
          
          // Cache kết quả trang trong 30 phút
          await cacheService.set(pageCacheKey, pageData, 1800);
          
          // Lưu tổng số manga vào cache (refresh mỗi 2 giờ)
          if (!cachedCount) {
            await cacheService.set(countCacheKey, pageData.total, 7200);
          }
        }
        
        // Thêm dữ liệu vào mảng kết quả
        allManga.push(...pageData.data);
        
        // Lấy tổng số manga nếu chưa có
        if (total === 0) {
          total = pageData.total;
        }
        
        // Kiểm tra xem còn dữ liệu không
        offset += limit;
        hasMoreData = offset < total;
        
        // Ngăn quá nhiều request liên tiếp
        if (hasMoreData) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay 500ms giữa các request
        }
      }
      
      console.log(`Đã lấy ${allManga.length}/${total} manga tiếng Việt từ MangaDex`);
      
      return {
        data: allManga,
        total
      };
    } catch (error) {
      console.error('Lỗi khi lấy tất cả manga tiếng Việt:', error.message);
      throw error;
    }
  },
  
  // Hàm tìm kiếm manga tiếng Việt với pagination
  async searchVietnameseManga(query = '', options = {}) {
    const {
      limit = 30,
      offset = 0,
      sort = 'relevance', // 'relevance', 'latestUploadedChapter', 'title', 'rating', 'followedCount'
      order = 'desc'      // 'asc', 'desc'
    } = options;
    
    const cacheKey = `mangadex:search:vi:${query}:${limit}:${offset}:${sort}:${order}`;
    
    // Kiểm tra cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log('Lấy kết quả tìm kiếm từ cache');
      return cachedData;
    }
    
    try {
      console.log(`Tìm kiếm manga tiếng Việt "${query}" từ MangaDex API`);
      
      const orderParams = {};
      if (sort === 'relevance' && query) {
        // Không cần thêm order params khi tìm kiếm theo relevance
      } else if (sort === 'latestUploadedChapter') {
        orderParams.latestUploadedChapter = order;
      } else if (sort === 'title') {
        orderParams.title = order;
      } else if (sort === 'rating') {
        orderParams.rating = order;
      } else if (sort === 'followedCount') {
        orderParams.followedCount = order;
      }
      
      const params = {
        title: query,
        limit,
        offset,
        availableTranslatedLanguage: ['vi'],
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'], // Lọc nội dung
        order: orderParams
      };
      
      // Xóa các tham số trống
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || 
            (typeof params[key] === 'object' && Object.keys(params[key]).length === 0)) {
          delete params[key];
        }
      });
      
      const response = await axios.get(`${MANGADEX_API}/manga`, params);
      
      // Cache kết quả trong 10 phút
      await cacheService.set(cacheKey, response.data, 600);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm manga tiếng Việt:', error.message);
      throw error;
    }
  }
};

module.exports = MangadexService;