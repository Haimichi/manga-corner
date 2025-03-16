import axiosClient from './axiosClient';

// Lấy danh sách manga mới nhất
export const getLatestManga = async (params = {}) => {
  try {
    const response = await axiosClient.get('/mangadex/latest', { params });
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy manga mới nhất:', error);
    throw error;
  }
};

// Lấy danh sách manga phổ biến
export const getPopularManga = async (params = {}) => {
  try {
    const response = await axiosClient.get('/mangadex/popular', { params });
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy manga phổ biến:', error);
    throw error;
  }
};

// Tìm kiếm manga
export const searchManga = async (query, params = {}) => {
  try {
    const response = await axiosClient.get('/mangadex/manga/search', {
      params: { ...params, q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm manga:', error);
    throw error;
  }
};

// Lấy chi tiết manga
export const getMangaDetails = async (mangaId) => {
  try {
    const response = await axiosClient.get(`/api/mangadex/manga/${mangaId}`);
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết manga:', error);
    throw error;
  }
};

// Lấy danh sách chapter
export const getChapters = async (mangaId, customParams = {}) => {
  try {
    // Thêm timestamp để luôn nhận dữ liệu mới
    const timestamp = Date.now();
    
    // Log thông tin request để debug
    console.log(`Frontend: Đang lấy chapters cho manga ${mangaId} tại ${new Date().toLocaleTimeString()}`);
    
    // Chuẩn bị params
    const params = {
      ...customParams,
      limit: customParams.limit || 100,
      offset: customParams.offset || 0,
      translatedLanguage: customParams.translatedLanguage || ['vi', 'en'],
      _t: timestamp // Thêm timestamp để bypass cache
    };
    
    // Gọi API với headers chống cache
    const response = await axiosClient.get(`/api/mangadex/manga/${mangaId}/chapters`, {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // Kiểm tra và log dữ liệu
    console.log(`Frontend: Nhận được ${response?.data?.data?.length || 0} chapters cho manga ${mangaId}`);
    if (response?.data?.data?.length > 0) {
      console.log('Frontend: Mẫu chapter đầu tiên:', response.data.data[0]);
    } else {
      console.warn('Frontend: Không có chapters nào được trả về!');
    }
    
    return response;
  } catch (error) {
    console.error(`Frontend: Lỗi khi lấy chapters cho manga ${mangaId}:`, error);
    throw error;
  }
};

// Tạo đối tượng API để export
const mangadexApi = {
  getLatestManga,
  getPopularManga,
  searchManga,
  getMangaDetails,
  getChapters
};

export default mangadexApi;