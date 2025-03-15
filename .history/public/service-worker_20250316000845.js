// Cache tên
const CACHE_NAME = 'manga-corner-cache-v1';

// Danh sách tài nguyên cần cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/images/default-cover.jpg'
];

// Cài đặt Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Chiến lược cache: Cache first, then network
self.addEventListener('fetch', event => {
  // Bỏ qua yêu cầu không phải HTTP(S)
  if (!event.request.url.startsWith('http')) return;
  
  // Bỏ qua yêu cầu API
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Chiến lược Cache then Network cho hình ảnh MangaDex
  if (event.request.url.includes('uploads.mangadex.org')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Trả về từ cache nếu có
          if (response) {
            return response;
          }
          
          // Không tìm thấy trong cache, tải từ mạng
          return fetch(event.request).then(
            response => {
              // Kiểm tra response hợp lệ
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone response để cache
              var responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            }
          );
        })
    );
    return;
  }
  
  // Chiến lược thông thường: Cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Xóa các cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Xóa cache không còn cần thiết
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 