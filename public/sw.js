
// Enhanced Emergency Service Worker
const CACHE_NAME = 'soteria-emergency-v2';
const EMERGENCY_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/sounds/emergency-ring.mp3',
  '/soteria-logo.png'
];

// Emergency data storage key
const EMERGENCY_DATA_KEY = 'soteria-emergency-data';

// Install event
self.addEventListener('install', (event) => {
  console.log('Emergency Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching emergency assets');
        return cache.addAll(EMERGENCY_ASSETS);
      })
      .then(() => {
        console.log('Emergency assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache emergency assets:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Emergency Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Emergency Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - Emergency mode: serve from cache first
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // Try network first for dynamic content
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.warn('Network failed, no cache available for:', event.request.url);
            // Return offline fallback for documents
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Offline - Emergency mode active', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for emergency data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'emergency-sync') {
    event.waitUntil(syncEmergencyData());
  }
});

// Push notifications for emergency alerts
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let notificationData = {
    title: 'Soteria Emergency Alert',
    body: 'Emergency alert received',
    icon: '/soteria-logo.png',
    badge: '/favicon.ico'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Alert',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      timestamp: Date.now(),
      type: 'emergency'
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Focus existing window if available
          for (const client of clientList) {
            if (client.url === self.location.origin && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if no existing window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Emergency data synchronization
async function syncEmergencyData() {
  try {
    console.log('Starting emergency data sync...');
    
    const emergencyData = await getStoredEmergencyData();
    
    if (emergencyData.length > 0) {
      console.log(`Syncing ${emergencyData.length} emergency records`);
      
      for (const data of emergencyData) {
        try {
          const response = await fetch('/api/emergency/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            console.log('Emergency data synced successfully:', data.id);
          } else {
            console.error('Failed to sync emergency data:', response.statusText);
            // Re-queue failed items
            await storeEmergencyData([data]);
          }
        } catch (error) {
          console.error('Error syncing emergency record:', error);
          // Re-queue failed items
          await storeEmergencyData([data]);
        }
      }
      
      // Clear successfully synced data
      await clearStoredEmergencyData();
      console.log('Emergency data sync completed');
    } else {
      console.log('No emergency data to sync');
    }
  } catch (error) {
    console.error('Emergency data sync failed:', error);
  }
}

// Storage utilities for emergency data
async function getStoredEmergencyData() {
  try {
    const data = await self.indexedDB ? getFromIndexedDB() : getFromLocalStorage();
    return data || [];
  } catch (error) {
    console.error('Error retrieving stored emergency data:', error);
    return [];
  }
}

async function storeEmergencyData(data) {
  try {
    if (self.indexedDB) {
      await storeInIndexedDB(data);
    } else {
      await storeInLocalStorage(data);
    }
  } catch (error) {
    console.error('Error storing emergency data:', error);
  }
}

async function clearStoredEmergencyData() {
  try {
    if (self.indexedDB) {
      await clearIndexedDB();
    } else {
      await clearLocalStorage();
    }
  } catch (error) {
    console.error('Error clearing stored emergency data:', error);
  }
}

// IndexedDB operations (preferred)
function getFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SoteriaEmergencyDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['emergencyData'], 'readonly');
      const store = transaction.objectStore('emergencyData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('emergencyData')) {
        db.createObjectStore('emergencyData', { keyPath: 'id' });
      }
    };
  });
}

function storeInIndexedDB(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SoteriaEmergencyDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['emergencyData'], 'readwrite');
      const store = transaction.objectStore('emergencyData');
      
      data.forEach(item => {
        store.put(item);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

function clearIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SoteriaEmergencyDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['emergencyData'], 'readwrite');
      const store = transaction.objectStore('emergencyData');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

// LocalStorage fallback
async function getFromLocalStorage() {
  try {
    const data = localStorage.getItem(EMERGENCY_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

async function storeInLocalStorage(data) {
  try {
    const existingData = await getFromLocalStorage();
    const combinedData = [...existingData, ...data];
    localStorage.setItem(EMERGENCY_DATA_KEY, JSON.stringify(combinedData));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

async function clearLocalStorage() {
  try {
    localStorage.removeItem(EMERGENCY_DATA_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Message handling for emergency actions
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'EMERGENCY_DATA') {
    // Store emergency data for later sync
    storeEmergencyData([event.data.payload]);
    
    // Attempt immediate sync if online
    if (navigator.onLine) {
      syncEmergencyData();
    }
  }
});
