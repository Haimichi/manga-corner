 // This is a minimal service worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    self.clients.claim();
  });
  
  // Fetch handler
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });