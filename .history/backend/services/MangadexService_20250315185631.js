const axios = require('axios');
const config = require('../config/config');

class MangadexService {
  constructor() {
    this.api = axios.create({
      baseURL: config.MANGADEX_API,
      timeout: 10000
    });
  }

  async getLatestManga(limit = 20, offset = 0) {
    try {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          order: {
            updatedAt: 'desc'
          }
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy manga mới nhất: ${error.message}`);
    }
  }

  async getPopularManga(limit = 20, offset = 0) {
    try {
      const response = await this.api.get('/manga', {
        params: {
          limit,
          offset,
          order: {
            followedCount: 'desc'
          }
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy manga phổ biến: ${error.message}`);
    }
  }

  async getMangaById(id) {
    try {
      const response = await this.api.get(`/manga/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin manga: ${error.message}`);
    }
  }

  async getChapters(mangaId) {
    try {
      const response = await this.api.get(`/manga/${mangaId}/feed`, {
        params: {
          translatedLanguage: ['en', 'vi'],
          order: {
            chapter: 'desc'
          }
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách chapter: ${error.message}`);
    }
  }
}

module.exports = new MangadexService();