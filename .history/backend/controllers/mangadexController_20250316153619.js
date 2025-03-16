const axios = require('axios');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cacheService = require('../services/cacheService');
const mangadexService = require('../services/mangadexService');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

// Thống nhất tên biến API
const MANGADEX_API = process.env.MANGADEX_API_URL || 'https://api.mangadex.org';
console.log('MangaDex API URL:', MANGADEX_API);

// Cache để lưu kết quả API trong 5 phút
const mangaCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Base URL của MangaDex API
const MANGADEX_API_BASE = process.env.MANGADEX_API || 'https://api.mangadex.org';

// Rate limiting để tránh bị chặn bởi MangaDex
const apiLimiter = {
  running: false,
  queue: [],
  lastCall: 0,
  minDelay: 200, // 200ms giữa các request

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  },

  async processQueue() {
    if (this.running || this.queue.length === 0) return;
    
    this.running = true;
    const now = Date.now();
    const delay = Math.max(0, this.lastCall + this.minDelay - now);
    
    setTimeout(async () => {
      const { fn, resolve, reject } = this.queue.shift();
      this.lastCall = Date.now();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.running = false;
        this.processQueue();
      }
    }, delay);
  }
};

// Helper để gọi MangaDex API với rate limiting và caching
const callMangadexApi = async (endpoint, params = {}, cacheKey = null) => {
  // Kiểm tra cache nếu có cacheKey
  if (cacheKey && mangaCache.has(cacheKey)) {
    return mangaCache.get(cacheKey);
  }

  // Thực hiện API call với rate limiting
  return apiLimiter.execute(async () => {
    try {
      const response = await axios.get(`${MANGADEX_API_BASE}${endpoint}`, { params });
      
      // Lưu vào cache nếu request thành công và có cacheKey
      if (cacheKey) {
        mangaCache.set(cacheKey, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`MangaDex API Error (${endpoint}):`, error.message);
      throw new AppError(error.response?.data?.message || 'Lỗi khi gọi MangaDex API', 500);
    }
  });
};

// Tìm kiếm manga từ MangaDex
exports.searchManga = async (req, res, next) => {
  try {
    const { title, limit = 18, offset = 0, sort, order, language } = req.query;
    
    // Tạo cacheKey dựa trên tham số request
    const cacheKey = `search:${JSON.stringify(req.query)}`;
    
    // Chuẩn bị params cho MangaDex API
    const params = {
      limit,
      offset,
      title,
      contentRating: ['safe', 'suggestive', 'erotica'], // Mặc định lọc nội dung
      includes: ['cover_art', 'author', 'artist'],
      order: {}
    };
    
    // Thêm order và sort nếu có
    if (sort && order) {
      params.order[sort] = order;
    }
    
    // Thêm language filter nếu có
    if (language) {
      params.translatedLanguage = [language];
    }
    
    const data = await callMangadexApi('/manga', params, cacheKey);
    
    // Xử lý dữ liệu để dễ sử dụng ở frontend
    const processedData = data.data.map(manga => {
      // Xử lý thông tin cover
      const coverId = manga.relationships.find(rel => rel.type === 'cover_art')?.id;
      const coverFilename = manga.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
      const coverUrl = coverId && coverFilename ? 
        `https://uploads.mangadex.org/covers/${manga.id}/${coverFilename}` : null;
        
      return {
        id: manga.id,
        title: manga.attributes.title,
        description: manga.attributes.description,
        status: manga.attributes.status,
        year: manga.attributes.year,
        contentRating: manga.attributes.contentRating,
        tags: manga.attributes.tags.map(tag => tag.attributes.name),
        coverUrl,
        createdAt: manga.attributes.createdAt,
        updatedAt: manga.attributes.updatedAt
      };
    });
    
    res.status(200).json({
      success: true,
      total: data.total,
      offset: parseInt(offset),
      limit: parseInt(limit),
      data: processedData
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết manga từ MangaDex
exports.getMangaDetails = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Đang lấy chi tiết manga ID: ${id} từ MangaDex...`);
    
    const response = await axios.get(`${MANGADEX_API}/manga/${id}`, {
      params: {
        includes: ['cover_art', 'author', 'artist']
      }
    });
    
    console.log('Lấy chi tiết manga thành công');
    
    res.status(200).json({
      status: 'success',
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết manga từ MangaDex:', error.message);
    if (error.response) {
      console.error('MangaDex API response:', error.response.data);
    }
    return next(new AppError('Lỗi khi lấy chi tiết manga từ MangaDex', 500));
  }
});

// Lấy danh sách chapter từ MangaDex
exports.getMangaChapters = async (req, res) => {
  try {
    const { mangaId } = req.params;
    
    // Lấy params từ query string
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const translatedLanguage = req.query.translatedLanguage || ['vi', 'en'];
    
    // Đảm bảo includes parameter đúng với API docs
    const params = {
      limit,
      offset,
      translatedLanguage: Array.isArray(translatedLanguage) ? translatedLanguage : [translatedLanguage],
      contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'], // Thêm tham số này để lấy tất cả loại nội dung
      includes: ['scanlation_group', 'user'], // Thêm user để hiển thị thông tin uploader
      order: { 
        chapter: 'desc',
        volume: 'desc'
      }
    };
    
    console.log(`Backend: Gọi API MangaDex chapters cho manga ${mangaId} với params:`, params);
    
    // Gọi API MangaDex với đúng endpoint và params
    const response = await axios.get(`${MANGADEX_API}/manga/${mangaId}/feed`, {
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
    });
    
    // Log để debug
    console.log(`Backend: Nhận được ${response.data.data?.length || 0} chapters cho manga ${mangaId}`);
    console.log('Backend: Mẫu chapter đầu tiên:', response.data.data?.[0]?.id);
    
    // Đảm bảo response không được cache ở browser
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`Backend: Lỗi khi lấy chapters cho manga ${req.params.mangaId}:`, error.message);
    console.error('Backend: Chi tiết lỗi:', error.response?.data);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Không thể lấy danh sách chapter', 
      error: error.message,
      details: error.response?.data || {}
    });
  }
};

// Lấy nội dung chapter từ MangaDex
exports.getChapterContent = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Đang lấy nội dung chapter ID: ${id} từ MangaDex...`);
    
    // 1. Lấy thông tin chapter
    const chapterResponse = await axios.get(`${MANGADEX_API}/chapter/${id}`);
    
    // 2. Lấy server và danh sách hình ảnh
    const serverResponse = await axios.get(`${MANGADEX_API}/at-home/server/${id}`);
    
    const result = {
      chapter: chapterResponse.data.data,
      images: serverResponse.data
    };
    
    console.log('Lấy nội dung chapter thành công');
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi lấy nội dung chapter từ MangaDex:', error.message);
    if (error.response) {
      console.error('MangaDex API response:', error.response.data);
    }
    return next(new AppError('Lỗi khi lấy nội dung chapter từ MangaDex', 500));
  }
});

// Thêm controller mới lấy tất cả manga tiếng Việt (với pagination)
exports.getAllVietnameseManga = catchAsync(async (req, res, next) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    // Chỉ lấy một trang dữ liệu thay vì toàn bộ để tránh request kéo dài
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        availableTranslatedLanguage: ['vi'],
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        order: { updatedAt: 'desc' }
      }
    });
    
    res.status(200).json({
      status: 'success',
      total: response.data.total,
      offset: parseInt(offset),
      limit: parseInt(limit),
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy manga tiếng Việt từ MangaDex:', error.message);
    return next(new AppError('Lỗi khi lấy manga tiếng Việt từ MangaDex', 500));
  }
});

// Thêm controller search manga tiếng Việt với nhiều tùy chọn
exports.searchVietnameseManga = catchAsync(async (req, res, next) => {
  try {
    const { 
      q = '', 
      limit = 30, 
      offset = 0,
      sort = 'relevance',
      order = 'desc'
    } = req.query;
    
    const result = await mangadexService.searchVietnameseManga(q, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      sort,
    });
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm manga tiếng Việt:', error.message);
    return next(new AppError('Lỗi khi tìm kiếm manga tiếng Việt', 500));
  }
});

// Lấy chi tiết về một manga
exports.getMangaDetail = async (req, res) => {
  try {
    const { mangaId } = req.params;
    
    if (!mangaId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID manga'
      });
    }
    
    console.log(`Backend: Gọi MangaDex API để lấy manga ${mangaId}`);
    
    const response = await axios.get(`${config.MANGADEX_API}/manga/${mangaId}`, {
      params: {
        'includes[]': ['cover_art', 'author', 'artist']
      }
    });
    
    // Log kết quả để debug
    console.log(`Backend: Đã nhận response từ MangaDex API cho manga ${mangaId}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Backend Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Không thể lấy thông tin manga',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết của chapter
exports.getChapterDetail = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const url = `${MANGADEX_API}/chapter/${chapterId}`;
    
    const response = await axios.get(url, {
      params: {
        includes: ['scanlation_group', 'user']
      }
    });

    res.status(200).json({
      status: 'success',
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chapter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi khi lấy thông tin chapter'
    });
  }
};

// Lấy các trang của chapter
exports.getChapterPages = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const url = `${MANGADEX_API}/at-home/server/${chapterId}`;
    
    const response = await axios.get(url);
    const { baseUrl, chapter } = response.data;
    
    // Tạo URL đầy đủ cho từng trang
    const pages = chapter.data.map((page, index) => ({
      index,
      url: `${baseUrl}/data/${chapter.hash}/${page}`
    }));

    res.status(200).json({
      status: 'success',
      data: pages
    });
  } catch (error) {
    console.error('Lỗi khi lấy trang chapter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi khi lấy trang chapter'
    });
  }
};

exports.getLatestManga = async (req, res) => {
  try {
    console.log('Đang gọi API getLatestManga');
    
    // Lấy và xử lý params đảm bảo luôn là số
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const offset = (page - 1) * limit;
    
    // Kiểm tra dữ liệu đầu vào
    console.log(`Tham số xử lý: page=${page}, limit=${limit}, offset=${offset}`);
    
    // Chuẩn bị params cho MangaDex API
    const params = {
      limit: limit,
      offset: offset, // Đảm bảo offset là số
      order: {
        updatedAt: 'desc'
      },
      includes: ['cover_art'],
      contentRating: ['safe', 'suggestive'],
      availableTranslatedLanguage: ['vi', 'en']
    };
    
    console.log(`Gọi MangaDex API với params:`, params);
    
    // Gọi API MangaDex
    const response = await axios.get(`${MANGADEX_API_BASE}/manga`, { params });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Lỗi chi tiết trong getLatestManga:', error);
    
    // Trả về lỗi với response rõ ràng để frontend xử lý
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách manga mới nhất',
      error: error.message,
      data: { data: [] } // Đảm bảo trả về cấu trúc dữ liệu nhất quán
    });
  }
};

exports.getMangaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `manga:${id}`;
    
    const data = await callMangadexApi(`/manga/${id}`, {
      includes: ['cover_art', 'author', 'artist']
    }, cacheKey);
    
    // Xử lý và định dạng dữ liệu trả về
    const manga = data.data;
    const coverId = manga.relationships.find(rel => rel.type === 'cover_art')?.id;
    const coverFilename = manga.relationships.find(rel => rel.type === 'cover_art')?.attributes?.fileName;
    const coverUrl = coverId && coverFilename ? 
      `https://uploads.mangadex.org/covers/${manga.id}/${coverFilename}` : null;
    
    // Lấy thông tin tác giả và họa sĩ
    const author = manga.relationships.find(rel => rel.type === 'author')?.attributes?.name;
    const artist = manga.relationships.find(rel => rel.type === 'artist')?.attributes?.name;
    
    const processedManga = {
      id: manga.id,
      title: manga.attributes.title,
      description: manga.attributes.description,
      status: manga.attributes.status,
      year: manga.attributes.year,
      contentRating: manga.attributes.contentRating,
      tags: manga.attributes.tags.map(tag => tag.attributes.name),
      coverUrl,
      author,
      artist,
      createdAt: manga.attributes.createdAt,
      updatedAt: manga.attributes.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: processedManga
    });
  } catch (error) {
    next(error);
  }
};

exports.getChapters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 30, offset = 0, language } = req.query;
    const cacheKey = `chapters:${id}:${limit}:${offset}:${language || 'all'}`;
    
    const params = {
      manga: id,
      limit,
      offset,
      includes: ['scanlation_group'],
      order: {
        chapter: 'desc'
      }
    };
    
    // Thêm language filter nếu có
    if (language) {
      params.translatedLanguage = [language];
    }
    
    const data = await callMangadexApi('/chapter', params, cacheKey);
    
    // Xử lý dữ liệu chapter
    const processedChapters = data.data.map(chapter => {
      // Lấy thông tin nhóm dịch
      const group = chapter.relationships.find(rel => rel.type === 'scanlation_group')?.attributes?.name || 'Unknown';
      
      return {
        id: chapter.id,
        title: chapter.attributes.title,
        chapter: chapter.attributes.chapter,
        volume: chapter.attributes.volume,
        language: chapter.attributes.translatedLanguage,
        pages: chapter.attributes.pages,
        group,
        publishAt: chapter.attributes.publishAt,
        createdAt: chapter.attributes.createdAt,
        updatedAt: chapter.attributes.updatedAt
      };
    });
    
    res.status(200).json({
      success: true,
      total: data.total,
      offset: parseInt(offset),
      limit: parseInt(limit),
      data: processedChapters
    });
  } catch (error) {
    next(error);
  }
};

exports.getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `chapter:${id}`;
    
    const data = await callMangadexApi(`/chapter/${id}`, {
      includes: ['scanlation_group', 'manga']
    }, cacheKey);
    
    // Xử lý dữ liệu chapter
    const chapter = data.data;
    const group = chapter.relationships.find(rel => rel.type === 'scanlation_group')?.attributes?.name || 'Unknown';
    const manga = chapter.relationships.find(rel => rel.type === 'manga');
    
    const processedChapter = {
      id: chapter.id,
      title: chapter.attributes.title,
      chapter: chapter.attributes.chapter,
      volume: chapter.attributes.volume,
      language: chapter.attributes.translatedLanguage,
      pages: chapter.attributes.pages,
      group,
      mangaId: manga?.id,
      mangaTitle: manga?.attributes?.title,
      publishAt: chapter.attributes.publishAt,
      createdAt: chapter.attributes.createdAt,
      updatedAt: chapter.attributes.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: processedChapter
    });
  } catch (error) {
    next(error);
  }
};

exports.getChapterPages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `pages:${id}`;
    
    // Lấy thông tin chapter
    const chapterData = await callMangadexApi(`/chapter/${id}`, {}, cacheKey);
    
    // Lấy URL của các trang
    const hash = chapterData.data.attributes.hash;
    const pages = chapterData.data.attributes.data;
    
    // Lấy danh sách server
    const serversData = await callMangadexApi(`/at-home/server/${id}`, {}, `server:${id}`);
    const baseUrl = serversData.baseUrl;
    
    // Tạo URL cho từng trang
    const pageUrls = pages.map(page => 
      `${baseUrl}/data/${hash}/${page}`
    );
    
    res.status(200).json({
      success: true,
      data: {
        pages: pageUrls,
        total: pages.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPopularManga = async (req, res) => {
  try {
    console.log('Đang gọi API getPopularManga');
    
    // Lấy và xử lý params đảm bảo luôn là số
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 18 : parseInt(req.query.limit);
    const language = req.query.language || 'vi';
    const offset = (page - 1) * limit;
    
    // Kiểm tra dữ liệu đầu vào
    console.log(`Tham số xử lý: page=${page}, limit=${limit}, offset=${offset}, language=${language}`);
    
    // Chuẩn bị params cho MangaDex API
    const params = {
      limit: limit,
      offset: offset,
      order: {
        followedCount: 'desc'
      },
      includes: ['cover_art'],
      availableTranslatedLanguage: [language],
      contentRating: ['safe', 'suggestive']
    };
    
    console.log(`Gọi MangaDex API với params:`, params);
    
    // Gọi API MangaDex
    const response = await axios.get(`${MANGADEX_API_BASE}/manga`, { params });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Lỗi chi tiết trong getPopularManga:', error);
    
    // Trả về lỗi với response rõ ràng để frontend xử lý
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách manga phổ biến',
      error: error.message,
      data: { data: [] } // Đảm bảo trả về cấu trúc dữ liệu nhất quán
    });
  }
};

// Thêm route kiểm tra lưu lượng API đơn giản nhất
exports.checkMangaDexAPI = async (req, res) => {
  try {
    // Tạo request đơn giản nhất
    const url = `${config.MANGADEX_API}/manga?limit=1`;
    console.log("Kiểm tra API MangaDex URL:", url);
    
    const response = await axios.get(url);
    
    res.status(200).json({
      status: 'success',
      message: 'Kết nối đến MangaDex API thành công',
      data: {
        apiStatus: 'online',
        apiResult: response.data.result,
        apiTotal: response.data.total,
        apiVersion: response.headers['x-api-version'] || 'unknown'
      }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra MangaDex API:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi từ MangaDex API:', error.response.data);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Không thể kết nối đến MangaDex API',
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
};

exports.getChapterDetails = async (req, res) => {
  try {
    const { chapterId } = req.params;
    
    // Gọi MangaDex API
    const response = await axios.get(`${MANGADEX_API}/chapter/${chapterId}`, {
      params: {
        includes: ['scanlation_group', 'user']
      }
    });
    
    return res.status(200).json({
      status: 'success',
      data: response.data.data
    });
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin chapter ${chapterId}:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy thông tin chapter'
    });
  }
};