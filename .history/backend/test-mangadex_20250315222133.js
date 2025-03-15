const axios = require('axios');
require('dotenv').config();

const MANGADEX_API = process.env.MANGADEX_API || 'https://api.mangadex.org';

async function testMangaDexConnection() {
  try {
    console.log('Kiểm tra kết nối đến MangaDex API...');
    console.log('Sử dụng URL:', MANGADEX_API);
    
    // Test kết nối cơ bản - lấy 5 manga tiếng Việt
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit: 5,
        availableTranslatedLanguage: ['vi']
      }
    });
    
    console.log('✅ Kết nối thành công đến MangaDex API!');
    console.log(`Tìm thấy ${response.data.data.length} manga từ MangaDex`);
    
    // Hiển thị thông tin chi tiết manga đầu tiên
    if (response.data.data.length > 0) {
      const firstManga = response.data.data[0];
      console.log('\n--- Thông tin manga đầu tiên ---');
      console.log('ID:', firstManga.id);
      console.log('Tiêu đề:', firstManga.attributes.title);
      console.log('Mô tả:', firstManga.attributes.description?.vi || 'Không có mô tả tiếng Việt');
      console.log('Trạng thái:', firstManga.attributes.status);
      console.log('---------------------------\n');
    }
    
    console.log('Tổng số manga tiếng Việt trên MangaDex:', response.data.total);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi kết nối đến MangaDex API:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi:', error.response.data);
    }
    return false;
  }
}

// Chạy test
testMangaDexConnection(); 