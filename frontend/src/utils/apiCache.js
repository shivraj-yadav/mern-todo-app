// Simple API response caching utility
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Generate cache key from URL and options
  generateKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body || '';
    return `${method}:${url}:${body}`;
  }

  // Get cached response if valid
  get(url, options = {}) {
    const key = this.generateKey(url, options);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.defaultTTL) {
      console.log(`📋 Cache hit: ${key}`);
      return cached.data;
    }
    
    return null;
  }

  // Store response in cache
  set(url, options = {}, data) {
    const key = this.generateKey(url, options);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached: ${key}`);
  }

  // Clear specific cache entry
  delete(url, options = {}) {
    const key = this.generateKey(url, options);
    this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const apiCache = new ApiCache();

// Cached fetch wrapper
export const cachedFetch = async (url, options = {}) => {
  // Only cache GET requests
  if (!options.method || options.method === 'GET') {
    const cached = apiCache.get(url, options);
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  try {
    const response = await fetch(url, options);
    const data = await response.clone();
    
    // Cache successful GET responses
    if (response.ok && (!options.method || options.method === 'GET')) {
      apiCache.set(url, options, data);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Cleanup cache every 10 minutes
setInterval(() => {
  apiCache.cleanup();
}, 10 * 60 * 1000);
