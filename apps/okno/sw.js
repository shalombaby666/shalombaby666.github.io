const PREFIX='okno-';
const V = 'okno-release-v4';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin && url.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    // network first so updates show up; cache is the offline fallback
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(V).then(c => res.ok ? c.put(req, copy) : undefined);
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.host)) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          const copy = res.clone();
          caches.open(V).then(c => res.ok ? c.put(req, copy) : undefined);
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
