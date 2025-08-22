// Enhanced service worker for Safety News App (Next.js 15 compatible)
const CACHE_NAME = 'safety-news-v1.1'; // Updated version to clear old caches
const urlsToCache = ['/', '/offline']; // Removed manifest.json from cache

console.log('Service Worker: Script loaded and executing');

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('App shell cached');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Skipping waiting and taking control...');
    self.skipWaiting();
    // Don't claim clients here - wait for activation event
  }
  
  if (event.data && event.data.type === 'CLEAR_OLD_CACHES') {
    console.log('Clearing old caches...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    console.log('Clearing ALL caches to fix auth issues...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Fetch event - serve from cache if available, but exclude auth requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // FIXED: Use || instead of ?? and add comprehensive auth exclusions
  const skipCaching =
    url.pathname.includes('/_next/') || // Next.js chunks and assets
    url.pathname.includes('/api/') || // API routes
    url.pathname.includes('webpack') || // Webpack specific files
    url.pathname.includes('chunk') || // Code splitting chunks
    url.pathname.includes('hmr') || // Hot module reload
    url.pathname.includes('__webpack') || // Webpack runtime
    url.pathname.includes('react-server-dom') || // React Server Components
    url.pathname.includes('turbopack') || // Turbopack files
    url.pathname.includes('compiled') || // Compiled files
    url.pathname.includes('dist') || // Distribution files
    url.searchParams.has('_rsc') || // React Server Components
    
    // CRITICAL: Comprehensive auth exclusions
    url.hostname.includes('supabase.co') || // Supabase requests
    url.hostname.includes('supabase.com') || // Supabase requests
    url.pathname.includes('/auth/') || // Auth routes
    url.pathname.includes('login') || // Login pages
    url.pathname.includes('logout') || // Logout pages
    url.pathname.includes('session') || // Session endpoints
    url.pathname.includes('token') || // Token endpoints
    url.pathname.includes('callback') || // OAuth callbacks
    
    // External services
    url.hostname.includes('tile.openstreetmap.org') || // Map tiles
    url.hostname.includes('openstreetmap.org') || // Map tiles
    url.hostname.includes('basemaps.cartocdn.com') || // Map tiles
    url.hostname.includes('cdnjs.cloudflare.com') || // CDN requests
    
    // Request types to skip
    event.request.method !== 'GET' || // Only cache GET requests
    event.request.headers.get('range') || // Skip range requests
    event.request.headers.get('authorization'); // Skip requests with auth headers

  // For non-GET requests, just pass through without caching
  if (event.request.method !== 'GET') {
    return;
  }

  if (skipCaching) {
    // For critical files and auth requests, always fetch from network
    return;
  }

  // For app shell and static assets, use cache-first strategy
  if (urlsToCache.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('Serving from cache:', url.href);
            return response;
          }
          console.log('Fetching and caching:', url.href);
          return fetch(event.request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            console.log('Serving offline page for:', url.href);
            return caches.match('/offline');
          }
        })
    );
    return;
  }

  // FIXED: Only cache static assets, not dynamic content
  const isStaticAsset = 
    url.pathname.includes('.css') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.png') ||
    url.pathname.includes('.jpg') ||
    url.pathname.includes('.jpeg') ||
    url.pathname.includes('.svg') ||
    url.pathname.includes('.ico') ||
    url.pathname.includes('.woff') ||
    url.pathname.includes('.woff2');

  if (isStaticAsset) {
    // For static assets, use network-first strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
  // For everything else (dynamic content), don't cache at all
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activation failed:', error);
      })
  );
});
