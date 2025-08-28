const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/uk-pool-tracker-roikic/",
  "/uk-pool-tracker-roikic/index.html",
  "/uk-pool-tracker-roikic/manifest.json",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
