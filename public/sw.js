// CampFit PWA Service Worker v1.1.0
// Estrategias: Cache-first para assets estáticos, Network-first para HTML

const CACHE_VERSION = 'campfit-v1.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Recursos a precachear en la instalación
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/favicon.svg',
    '/pwa-icon-192.png',
    '/pwa-icon-512.png',
];

// Patrones de assets estáticos (inmutables con hash de Astro)
const STATIC_ASSET_PATTERNS = [
    /\/_astro\//,      // Assets con hash de Astro
    /\.css$/,
    /\.js$/,
    /\.png$/,
    /\.svg$/,
    /\.woff2?$/,
];

// Dominios que no deben ser interceptados (Firebase, Google Fonts, etc.)
const EXCLUDED_HOSTS = [
    'firebase',
    'googleapis',
    'gstatic',
    'fonts.googleapis',
    'fonts.gstatic',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter((name) => !name.startsWith(CACHE_VERSION))
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Solo interceptar GET
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Excluir dominios externos (Firebase, Google Fonts, etc.)
    if (EXCLUDED_HOSTS.some((host) => url.hostname.includes(host))) return;
    if (url.pathname.startsWith('/__/')) return;

    // Estrategia 1: Cache-first para assets estáticos
    if (STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Estrategia 2: Network-first para navegación (HTML)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request).then((cached) => cached || caches.match('/'))
                )
        );
        return;
    }

    // Estrategia 3: Stale-while-revalidate para otras peticiones del mismo origen
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response.status === 200) {
                            const clone = response.clone();
                            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                        }
                        return response;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
    }
});