/* sw.js */
const CACHE_NAME = 'sabertool-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/core/data.js',
  './js/core/utils.js',
  './js/core/charts.js',
  './js/core/storage.js',
  './js/modules/ui.js',
  './js/modules/state.js',
  './js/modules/settings.js',
  './js/modules/smartInput.js',
  './js/modules/export.js',
  './js/tabs/batter.js',
  './js/tabs/pitcher.js',
  './js/tabs/team.js',
  './js/tabs/prediction.js',
  './js/tabs/comparison.js',
  './js/tabs/tools.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://unpkg.com/@popperjs/core@2',
  'https://unpkg.com/tippy.js@6'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});