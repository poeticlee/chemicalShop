/* Chemical Shop service worker: app-shell offline support.
   - Precache core routes on install; cache-first for static assets.
   - Navigations: network-first, fall back to cached shell, then offline page.
   - API POSTs are never cached (Dexie outbox in lib/offline.ts queues them). */
const CACHE = "chemshop-v1";
const SHELL = ["/", "/pos", "/login", "/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(request).then((hit) => hit ?? Response.json({ error: "offline" }, { status: 503 })))
    );
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(request).then((hit) => hit ?? caches.match("/offline").then((off) => off ?? caches.match("/"))))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((hit) => hit ?? fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      return res;
    }))
  );
});
