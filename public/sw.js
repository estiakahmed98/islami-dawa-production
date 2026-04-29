const CACHE_NAME = "islami-dawa-static-v2";
const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/icons/pwd-logo-192.png",
  "/icons/pwd-logo-512.png",
];

const CACHEABLE_DESTINATIONS = new Set([
  "style",
  "script",
  "worker",
  "image",
  "font",
]);

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isStaticAssetRequest(request) {
  const url = new URL(request.url);

  if (request.method !== "GET" || !isSameOrigin(url)) {
    return false;
  }

  if (request.mode === "navigate") {
    return false;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/auth/")) {
    return false;
  }

  if (PRECACHE_URLS.includes(url.pathname)) {
    return true;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    return true;
  }

  return CACHEABLE_DESTINATIONS.has(request.destination);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }

          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (!isStaticAssetRequest(event.request)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || !response.ok) {
          return response;
        }

        const responseClone = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
        );

        return response;
      });
    })
  );
});
