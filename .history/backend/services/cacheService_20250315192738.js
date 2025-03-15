const Redis = require('ioredis');
const config = require('../config/config');

class CacheService {
  constructor() {
    this.isRedisAvailable = false;
    this.localCache = new Map();

    // Thử kết nối Redis
    try {
      this.redis = new Redis({
        host: 'localhost',
        port: 6379,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 1
      });

      this.redis.on('connect', () => {
        console.log('Redis đã kết nối thành công');
        this.isRedisAvailable = true;
      });

      this.redis.on('error', (error) => {
        console.log('Redis không khả dụng, sử dụng local cache:', error.message);
        this.isRedisAvailable = false;
      });

    } catch (error) {
      console.log('Không thể kết nối Redis, sử dụng local cache');
      this.isRedisAvailable = false;
    }

    this.defaultTTL = 3600; // 1 giờ
  }

  async get(key) {
    try {
      if (this.isRedisAvailable) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        const item = this.localCache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
          this.localCache.delete(key);
          return null;
        }
        return item.value;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (this.isRedisAvailable) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      } else {
        this.localCache.set(key, {
          value,
          expiry: Date.now() + (ttl * 1000)
        });
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.isRedisAvailable) {
        await this.redis.del(key);
      } else {
        this.localCache.delete(key);
      }
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