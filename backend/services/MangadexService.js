const axios = require('axios');
const cacheService = require('./cacheService');
const config = require('../config/config');

class MangadexService {
  constructor() {
    this.api = axios.create({
      baseURL: config.MANGADEX_API,
      timeout: 10000
    });
  }

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
  }

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
  }

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
  }

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
  }

  async getChapterPages(chapterId) {
    const response = await this.api.get(`/at-home/server/${chapterId}`);
    return response.data;
  }

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
  }

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
  }
}

module.exports = new MangadexService();