// Helper quản lý cache
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 phút

// Lưu vào localStorage với thời gian hết hạn
export const setWithExpiry = (key, value, ttl = CACHE_EXPIRY) => {
  const item = {
    value: value,
    expiry: new Date().getTime() + ttl,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu vào cache:', error);
    return false;
  }
};

// Lấy dữ liệu từ localStorage với kiểm tra hết hạn
export const getWithExpiry = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Lỗi khi đọc từ cache:', error);
    return null;
  }
};

// Xóa một mục khỏi cache
export const removeCache = (key) => {
  localStorage.removeItem(key);
};

// Xóa tất cả cache
export const clearCache = () => {
  const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('manga_'));
  cacheKeys.forEach(key => localStorage.removeItem(key));
};