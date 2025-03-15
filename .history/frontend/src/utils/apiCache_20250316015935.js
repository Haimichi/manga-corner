// Tạo file: src/utils/apiCache.js
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

class ApiCache {
  constructor() {
    this.cache = {};
  }

  get(key) {
    const item = this.cache[key];
    if (!item) return null;

    // Kiểm tra nếu dữ liệu còn hạn
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return null;
    }

    return item.data;
  }

  set(key, data, customDuration = null) {
    const expiry = Date.now() + (customDuration || CACHE_DURATION);
    this.cache[key] = { data, expiry };
  }

  clear() {
    this.cache = {};
  }

  remove(key) {
    delete this.cache[key];
  }
}

export default new ApiCache();