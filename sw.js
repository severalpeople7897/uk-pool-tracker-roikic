const CACHE_NAME = "uk-pool-tracker-cache-v1";
const urlsToCache = [
  "/uk-pool-tracker-roikic/",
  "/uk-pool-tracker-roikic/index.html",
  "/uk-pool-tracker-roikic/manifest.json",
  "/uk-pool-tracker-roikic/favicon.ico",
  "/uk-pool-tracker-roikic/logo192x192.png",
  "/uk-pool-tracker-roikic/logo512x512.png",
  // JS / CSS bundles (examples — update with real file names from /assets)
  "/uk-pool-tracker-roikic/assets/017bc6ba3fc25503e5eb5e53826d48a8",
  "/uk-pool-tracker-roikic/assets/31b5ffea3daddc69dd01a1f3d6cf63c5",
  "/uk-pool-tracker-roikic/assets/4403c6117ec30c859bc95d70ce4a71d3",
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
