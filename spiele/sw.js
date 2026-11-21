// Service Worker: macht die Spiele nach dem ersten Aufruf offline spielbar.
// Strategie: sofort aus dem Cache liefern, im Hintergrund still aktualisieren.
const CACHE = 'spiele-v4';
const FILES = [
  './haende-spiel.html',
  './atem-ballon.html',
  './tier-pause.html',
  './zeit-uhr.html',
  '../images/ASS_infinity_awareness_symbol.png',
  '../images/logoneu.jpg'
];
const PATHS = FILES.map((f) => new URL(f, self.location).pathname);

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
  // Nur die Spiele und die Bilder im Header offline halten, nicht die Übersichtsseite im selben Ordner
  if (e.request.method !== 'GET' || PATHS.indexOf(new URL(e.request.url).pathname) < 0) return;
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
