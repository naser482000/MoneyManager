// Service Worker - مدیریت مالی ناصر نیک‌نیا
const CACHE_NAME = 'naser-finance-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// نصب
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch
self.addEventListener('fetch', (event) => {
  // فقط GET ها
  if (event.request.method !== 'GET') return;
  
  // API ها رو کش نکن
  if (event.request.url.includes('api.') || 
      event.request.url.includes('kavenegar') ||
      event.request.url.includes('coingecko') ||
      event.request.url.includes('er-api')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        
        return fetch(event.request).then(resp => {
          if (!resp || resp.status !== 200 || resp.type !== 'basic') {
            return resp;
          }
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return resp;
        }).catch(() => {
          return caches.match('./index.html');
        });
      })
  );
});
