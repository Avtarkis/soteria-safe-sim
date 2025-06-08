
// Soteria Emergency Service Worker
// Handles offline support, emergency caching, and background sync

const CACHE_NAME = 'soteria-emergency-v1';
const EMERGENCY_CACHE = 'soteria-emergency-data';

// Essential files to cache for offline emergency functionality
const EMERGENCY_FILES = [
  '/',
  '/emergency',
  '/manifest.json',
  '/soteria-logo.png',
  // Add other critical emergency files
];

// Install event - cache essential emergency files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(EMERGENCY_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== EMERGENCY_CACHE)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache for emergency files
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/emergency') || event.request.url.includes('/api/emergency')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              // Cache successful emergency API responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(EMERGENCY_CACHE)
                  .then((cache) => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
  }
});

// Background sync for emergency data
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    event.waitUntil(syncEmergencyData());
  }
});

async function syncEmergencyData() {
  try {
    const data = await getStoredEmergencyData();
    if (data) {
      const response = await fetch('/api/emergency/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await clearStoredEmergencyData();
        console.log('Emergency data synced successfully');
      }
    }
  } catch (error) {
    console.error('Emergency sync failed:', error);
  }
}

async function getStoredEmergencyData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('SoteriaEmergency', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
    
    request.onerror = () => resolve(null);
  });
}

async function clearStoredEmergencyData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('SoteriaEmergency', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve(true);
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/soteria-logo.png',
      badge: '/favicon.ico',
      vibrate: data.emergency ? [200, 100, 200, 100, 200] : [100],
      data: data.data,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'emergency') {
    event.waitUntil(
      clients.openWindow('/emergency')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
