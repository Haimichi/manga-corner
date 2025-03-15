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
    
    // Đảm bảo cấu trúc phản hồi đúng
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
      // Đảm bảo vẫn có cấu trúc pagination mặc định để tránh lỗi
      pagination: {
        limit: 12,
        offset: 0,
        total: 0
      }
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
    const { limit = 30, offset = 0, language = 'vi' } = req.query;

    // Sử dụng cú pháp tham số phù hợp với API MangaDex
    const params = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      'translatedLanguage[]': [language],
      'order[chapter]': 'desc',
      'includes[]': ['scanlation_group']
    };
    
    const url = `${config.MANGADEX_API}/manga/${mangaId}/feed?${new URLSearchParams(params).toString()}`;
    console.log("Gọi API MangaDex chapters URL:", url);
    
    const response = await axios.get(url);
    
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chapter:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi từ MangaDex API:', error.response.data);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách chapter từ MangaDex API',
      error: error.message,
      details: error.response ? error.response.data : null
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
    
    const params = {
      'includes[]': ['cover_art', 'author', 'artist']
    };
    
    console.log("Gọi API MangaDex manga detail với params:", JSON.stringify(params));
    
    const response = await axios.get(`${config.MANGADEX_API}/manga/${mangaId}`, { params });
    
    // Đảm bảo cấu trúc dữ liệu đúng
    if (!response.data || !response.data.data) {
      console.error("Phản hồi không hợp lệ từ MangaDex:", response.data);
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy thông tin manga'
      });
    }
    
    // Đảm bảo có relationships
    if (!response.data.data.relationships) {
      response.data.data.relationships = [];
    }
    
    // Trả về dữ liệu theo cấu trúc chuẩn
    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết manga:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy chi tiết manga từ MangaDex API',
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

    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('offset', offset);
    
    // Thêm cả tiếng Việt và tiếng Anh
    params.append('translatedLanguage[]', 'vi');
    params.append('translatedLanguage[]', 'en');
    
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');
    params.append('contentRating[]', 'erotica');
    
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    
    params.append('order[followedCount]', 'desc');
    
    const url = `${config.MANGADEX_API}/manga?${params.toString()}`;
    console.log("Gọi API MangaDex Popular manga URL:", url);
    
    const response = await axios.get(url);
    
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

// Thêm route mới để xác định API MangaDex có hoạt động hay không
exports.checkMangaDexAPI = async (req, res) => {
  try {
    // Gọi API với tham số đơn giản nhất
    const params = new URLSearchParams();
    params.append('limit', 1);
    params.append('contentRating[]', 'safe');
    
    const url = `${config.MANGADEX_API}/manga?${params.toString()}`;
    console.log("Kiểm tra API MangaDex URL:", url);
    
    const response = await axios.get(url);
    
    res.status(200).json({
      status: 'success',
      message: 'Kết nối đến MangaDex API thành công',
      data: {
        apiStatus: 'online',
        apiResult: response.data.result,
        apiVersion: response.headers['x-api-version'] || 'unknown'
      }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra MangaDex API:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Không thể kết nối đến MangaDex API',
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
}; 