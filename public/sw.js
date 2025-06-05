
// Emergency Service Worker
const CACHE_NAME = 'soteria-emergency-v1';
const EMERGENCY_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical emergency assets
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(EMERGENCY_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Emergency mode: serve from cache first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    event.waitUntil(syncEmergencyData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Emergency alert received',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Alert'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Soteria Emergency Alert', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function syncEmergencyData() {
  try {
    // Get stored emergency data
    const emergencyData = await getStoredEmergencyData();
    
    if (emergencyData.length > 0) {
      // Send to server when online
      for (const data of emergencyData) {
        await fetch('/api/emergency/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      }
      
      // Clear stored data after successful sync
      await clearStoredEmergencyData();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getStoredEmergencyData() {
  // Implementation would depend on your storage method
  return [];
}

async function clearStoredEmergencyData() {
  // Implementation would depend on your storage method
}
