const axios = require('axios');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cacheService = require('../services/cacheService');
const mangadexService = require('../services/mangadexService');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

const MANGADEX_API = config.MANGADEX_API;
console.log('MangaDex API URL:', MANGADEX_API);

// Tìm kiếm manga từ MangaDex
exports.searchManga = async (req, res) => {
  try {
    const { limit = 12, offset = 0, sort = 'latestUploadedChapter', order = 'desc', language = 'vi' } = req.query;
    
    // Tạo đối tượng params phù hợp với API MangaDex
    const params = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      // Sử dụng 'availableTranslatedLanguage' thay vì 'translatedLanguage'
      'availableTranslatedLanguage[]': [language, 'en'],
      'contentRating[]': ['safe', 'suggestive', 'erotica'],
      'includes[]': ['cover_art', 'author', 'artist']
    };
    
    // Thêm tham số sắp xếp
    if (sort === 'latestUploadedChapter') {
      params['order[updatedAt]'] = order;
    } else if (sort === 'followedCount') {
      params['order[followedCount]'] = order;
    } else if (sort === 'createdAt') {
      params['order[createdAt]'] = order;
    } else {
      params['order[relevance]'] = order;
    }
    
    console.log("Gọi API MangaDex với params:", JSON.stringify(params));
    
    const response = await axios.get(`${config.MANGADEX_API}/manga`, { params });
    
    const responseData = {
      status: 'success',
      data: response.data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: response.data.total || 0
      }
    };
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm manga:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi từ MangaDex API:', error.response.data);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tìm kiếm manga từ MangaDex API',
      error: error.message,
      details: error.response ? error.response.data : null
    });
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
    
    const MANGADEX_API = process.env.MANGADEX_API_URL || 'https://api.mangadex.org';
    
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

exports.getPopularManga = async (req, res) => {
  try {
    const { limit = 12, offset = 0 } = req.query;

    // Sử dụng cú pháp tham số phù hợp với API MangaDex
    const params = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      'availableTranslatedLanguage[]': ['vi', 'en'],
      'contentRating[]': ['safe', 'suggestive', 'erotica'],
      'includes[]': ['cover_art', 'author', 'artist'],
      'order[followedCount]': 'desc'
    };
    
    console.log("Gọi API MangaDex popular manga với params:", JSON.stringify(params));
    
    const response = await axios.get(`${config.MANGADEX_API}/manga`, { params });
    
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy manga phổ biến:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi từ MangaDex API:', error.response.data);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy manga phổ biến từ MangaDex API',
      error: error.message,
      details: error.response ? error.response.data : null
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