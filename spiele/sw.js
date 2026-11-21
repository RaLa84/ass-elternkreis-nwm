// Service Worker: macht das Hände-Spiel nach dem ersten Aufruf offline spielbar.
// Strategie: sofort aus dem Cache liefern, im Hintergrund still aktualisieren.
const CACHE = 'haende-spiel-v2';
const FILES = ['./haende-spiel.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Nur das Spiel selbst offline halten, nicht die Übersichtsseite im selben Ordner
  if (e.request.method !== 'GET' || !new URL(e.request.url).pathname.endsWith('/haende-spiel.html')) return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((cached) => {
        const fresh = fetch(e.request)
          .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
          .catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
