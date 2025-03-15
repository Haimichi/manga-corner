const Redis = require('ioredis');
const config = require('../config/config');

class CacheService {
  constructor() {
    this.redis = new Redis(config.REDIS_URL);
    this.defaultTTL = 3600; // 1 giờ
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  generateKey(...args) {
    return args.join(':');
  }
}

module.exports = new CacheService();