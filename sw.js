const CACHE_NAME = 'bankday-v7'; // <-- Mudamos para v7 para forçar a atualização

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Lista de URLs locais para salvar no cache
        const urls = [
          './',
          './index.html',
          './style.css',
          './script.js',
          './manifest.json',
          './icon-192x192.png',
          './icon-512x512.png',
          './favicon.png'
        ];
        
        return Promise.all(
          urls.map(url => 
            cache.add(url).catch(err => {
              console.warn('Falhou ao colocar no cache:', url, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Estratégia Network-First: Tenta buscar a versão mais recente na rede. 
  // Se falhar (offline), usa o que está na cache.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
