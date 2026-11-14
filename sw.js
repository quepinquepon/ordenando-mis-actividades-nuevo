// Cada vez que hagas un cambio importante en la app, cambiá el número (ej: v1.1, v1.2, v1.3)
const CACHE_NAME = 'ordenando-actividades-v1.1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg'
];

// 1. Instalación: guarda los archivos nuevos y fuerza la activación inmediata
self.addEventListener('install', event => {
  self.skipWaiting(); // Obliga al nuevo Service Worker a tomar el control sin esperar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activación: borra automáticamente las versiones viejas de la caché
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Elimina la memoria vieja del celular
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de la app abierta al instante
  );
});

// 3. Estrategia Network-First: si hay internet, trae lo último de GitHub; si no hay, usa lo guardado
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si obtuvo respuesta nueva de GitHub, actualiza la copia guardada en el celular
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si el usuario está sin internet, carga la versión guardada
        return caches.match(event.request);
      })
  );
});
