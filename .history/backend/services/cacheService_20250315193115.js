const Redis = require('ioredis');
const config = require('../config/config');

class CacheService {
  constructor() {
    this.redis = new Redis(config.REDIS_URL);
    this.redis.on('error', (err) => console.error('Redis Error:', err));
  }

  async get(key) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttlSeconds = 3600) {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key) {
    await this.redis.del(key);
  }

  generateKey(...args) {
    return args.join(':');
  }

  async clearCache(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}

module.exports = new CacheService();