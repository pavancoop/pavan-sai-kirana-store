// A simple, no-op service worker to satisfy PWA install requirements.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We just let the browser handle all network requests normally.
  // This satisfies the "must have a fetch event handler" requirement for PWA installation.
});
