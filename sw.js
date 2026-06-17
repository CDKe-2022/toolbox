const CACHE_NAME = 'toolbox-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/common.css',
  '/assets/js/common.js',
  '/assets/js/components.js',
  '/assets/js/tools-data.js',
  '/assets/js/home.js',
  '/tools/number-to-chinese.html',
  '/tools/image-to-pdf.html',
  '/tools/pdf-split-merge.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
        
        return cachedResponse || fetchPromise;
      })
  );
});
