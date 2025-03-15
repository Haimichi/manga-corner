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
    
    // Dùng cách tiếp cận đơn giản hơn - gọi API riêng biệt cho từng sắp xếp/tìm kiếm
    let url = '';
    
    // Kiểm tra xem loại sắp xếp nào được yêu cầu và sử dụng URL chính xác
    if (sort === 'latestUploadedChapter') {
      url = `${config.MANGADEX_API}/manga?limit=${limit}&offset=${offset}&order[updatedAt]=desc&translatedLanguage[]=${language}&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&includes[]=author&includes[]=artist`;
    } else if (sort === 'followedCount') {
      url = `${config.MANGADEX_API}/manga?limit=${limit}&offset=${offset}&order[followCount]=desc&translatedLanguage[]=${language}&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&includes[]=author&includes[]=artist`;
    } else {
      // Mặc định sắp xếp theo updatedAt nếu sort không được nhận dạng
      url = `${config.MANGADEX_API}/manga?limit=${limit}&offset=${offset}&order[updatedAt]=desc&translatedLanguage[]=${language}&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&includes[]=author&includes[]=artist`;
    }
    
    console.log("Gọi API MangaDex URL:", url);
    
    try {
      const response = await axios.get(url);
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
    } catch (apiError) {
      console.error('Lỗi khi gọi MangaDex API:', apiError.message);
      console.log('Trả về mock data thay thế');
      
      // Trả về mock data khi API gặp lỗi
      const mockData = {
        result: 'ok',
        data: Array(12).fill(0).map((_, index) => ({
          id: `mock-id-${index}`,
          type: "manga",
          attributes: {
            title: {
              en: `Mock Manga ${index + 1}`,
              vi: `Truyện Mẫu ${index + 1}`
            },
            description: {
              en: "This is a mock manga for development",
              vi: "Đây là truyện mẫu phục vụ phát triển"
            },
            year: 2022,
            status: "ongoing"
          },
          relationships: [
            {
              id: `mock-cover-${index}`,
              type: "cover_art",
              attributes: {
                fileName: "mock-cover.jpg"
              }
            }
          ]
        })),
        total: 100,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      res.status(200).json({
        status: 'success',
        data: mockData,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: 100
        },
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Lỗi khi tìm kiếm manga:', error);
    
    // Bắt lỗi ReferenceError limit is not defined
    // Đảm bảo sử dụng các giá trị mặc định cho limit và offset
    const defaultLimit = 12;
    const defaultOffset = 0;
    
    // Trả về mock data an toàn với các giá trị mặc định
    const mockData = {
      result: 'ok',
      data: Array(defaultLimit).fill(0).map((_, index) => ({
        id: `mock-id-${index}`,
        type: "manga",
        attributes: {
          title: {
            en: `Mock Manga ${index + 1}`,
            vi: `Truyện Mẫu ${index + 1}`
          },
          description: {
            en: "This is a mock manga for development",
            vi: "Đây là truyện mẫu phục vụ phát triển"
          },
          year: 2022,
          status: "ongoing"
        },
        relationships: [
          {
            id: `mock-cover-${index}`,
            type: "cover_art",
            attributes: {
              fileName: "mock-cover.jpg"
            }
          }
        ]
      })),
      total: 100,
      limit: defaultLimit,
      offset: defaultOffset
    };
    
    res.status(200).json({
      status: 'success',
      data: mockData,
      pagination: {
        limit: defaultLimit,
        offset: defaultOffset,
        total: 100
      },
      isMockData: true,
      error: error.message
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

    // Sử dụng cấu trúc URL cố định thay vì dùng URLSearchParams
    const url = `${config.MANGADEX_API}/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&translatedLanguage[]=${language}&order[chapter]=desc&includes[]=scanlation_group`;
    
    console.log("Gọi API MangaDex chapters URL:", url);
    
    try {
      const response = await axios.get(url);
      res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (apiError) {
      console.error('Lỗi khi gọi MangaDex API cho chapters:', apiError.message);
      
      // Trả về mock data cho chapters
      const mockChapters = {
        result: 'ok',
        data: Array(10).fill(0).map((_, index) => ({
          id: `mock-chapter-${index}`,
          type: "chapter",
          attributes: {
            volume: "1",
            chapter: `${index + 1}`,
            title: `Chapter ${index + 1}`,
            translatedLanguage: "vi",
            pages: 15,
            createdAt: new Date().toISOString()
          },
          relationships: []
        })),
        total: 10
      };
      
      res.status(200).json({
        status: 'success',
        data: mockChapters,
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chapter:', error);
    
    // Trả về mock data an toàn
    const mockChapters = {
      result: 'ok',
      data: Array(10).fill(0).map((_, index) => ({
        id: `mock-chapter-${index}`,
        type: "chapter",
        attributes: {
          volume: "1",
          chapter: `${index + 1}`,
          title: `Chapter ${index + 1}`,
          translatedLanguage: "vi",
          pages: 15,
          createdAt: new Date().toISOString()
        },
        relationships: []
      })),
      total: 10
    };
    
    res.status(200).json({
      status: 'success',
      data: mockChapters,
      isMockData: true,
      error: error.message
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
    const url = `${MANGADEX_API}/manga/${mangaId}`;
    
    const response = await axios.get(url, {
      params: {
        includes: ['cover_art', 'author', 'artist']
      }
    });

    res.status(200).json({
      status: 'success',
      data: response.data.data
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin manga:', error);
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi khi lấy thông tin manga'
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