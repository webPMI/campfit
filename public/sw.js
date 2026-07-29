// CampFit PWA Service Worker v1.0.0
const CACHE_NAME = 'campfit-v1';

// Recursos a precachear (se actualizan en cada build)
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/favicon.svg',
    '/pwa-icon-192.png',
    '/pwa-icon-512.png'
];

// Instalación: precachear recursos estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Estrategia: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') return;

    // No interceptar peticiones a Firebase (ya tienen su propio manejo)
    const url = new URL(event.request.url);
    if (
        url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis') ||
        url.hostname.includes('gstatic') ||
        url.pathname.startsWith('/__/')
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cachear respuestas exitosas
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback a cache si no hay red
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;

                    // Si es una navegación, devolver la página principal
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }

                    return new Response('Offline', { status: 503 });
                });
            })
    );
});