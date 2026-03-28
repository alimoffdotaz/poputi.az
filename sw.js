/* poputi PWA — prototip SW: şəbəkə üstünlüklü, uğurlu cavabları keşə yazır, əlavə buraxılışda CACHE adını dəyişin */
var CACHE = 'poputi-v6';
var PRECACHE_REL = ['./', './index.html', './sw.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  var scope = self.registration.scope;
  var urls = PRECACHE_REL.map(function(p) { return new URL(p, scope).href; });
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(urls).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k.indexOf('poputi-') === 0 && k !== CACHE; })
          .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, copy);
          });
        }
        return res;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
