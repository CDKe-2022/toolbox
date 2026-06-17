const CACHE_NAME = 'toolbox-v1.1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/common.css',
  '/assets/js/common.js',
  '/assets/js/tools-data.js',
  '/assets/js/home.js',
  '/tools/number-to-chinese.html',
  '/tools/number-to-chinese.js',
  '/tools/image-to-pdf.html',
  '/tools/image-to-pdf.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 跨域请求不拦截
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(res => {
        // 缓存新请求的资源
        if (e.request.method === 'GET' && res.ok) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      });
    }).catch(() => {
      // 离线兜底
      if (e.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
