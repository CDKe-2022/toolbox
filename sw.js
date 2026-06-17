const CACHE_NAME = 'toolbox-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/common.css',
  '/assets/js/common.js',
  '/assets/js/components.js',
  '/assets/js/tools-data.js',
  '/assets/js/home.js', // 新增
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
      .then(response => {
        return response || fetch(event.request);
      })
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
