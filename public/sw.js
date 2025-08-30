/**
 * PHASE 3: Service Worker pour GameHub Retro
 * Gestion du cache et fonctionnalités offline
 */

const CACHE_NAME = "gamehub-retro-v3";
const STATIC_CACHE = "gamehub-retro-static-v3";
const DYNAMIC_CACHE = "gamehub-retro-dynamic-v3";

// Ressources à mettre en cache statiquement
const STATIC_ASSETS = [
  "/",
  "/public/styles.css",
  "/public/main.js",
  "/public/js/phase3-enhancements.js",
  "/public/js/mcp-admin.js",
  "/public/images/mario2.png",
  "/public/images/duckhunt3.gif",
  "/public/images/duckhunt4.png",
  "/public/images/duckhunt6.jpg",
  "/public/images/dh.png",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
  console.log("🚀 PHASE 3: Service Worker installé");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("📦 Cache statique ouvert");
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la mise en cache:", error);
      })
  );

  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  console.log("✅ PHASE 3: Service Worker activé");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("🗑️ Suppression de l'ancien cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie de cache pour les assets statiques
  if (request.method === "GET" && isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  }
  // Stratégie de cache pour les pages
  else if (request.method === "GET" && request.destination === "document") {
    event.respondWith(networkFirst(request));
  }
  // Stratégie par défaut : réseau d'abord
  else {
    event.respondWith(networkFirst(request));
  }
});

// Stratégie Cache First pour les assets statiques
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Retourner une page d'erreur offline si disponible
    return caches.match("/offline.html") || new Response("Mode hors ligne");
  }
}

// Stratégie Network First pour les pages
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Page d'erreur offline
    return caches.match("/offline.html") || new Response("Mode hors ligne");
  }
}

// Vérifier si c'est un asset statique
function isStaticAsset(request) {
  return (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  );
}

// Gestion des messages du client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({
      version: "3.0.0",
      phase: "PHASE 3",
      features: ["Lazy Loading", "Animations Avancées", "Notifications", "PWA"],
    });
  }
});

// Gestion des notifications push (pour la Phase 3)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "Nouvelle notification GameHub Retro",
      icon: "/public/images/dh.png",
      badge: "/public/images/dh.png",
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "GameHub Retro", options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Synchronisation des données en arrière-plan
    console.log("🔄 Synchronisation en arrière-plan...");

    // Ici on pourrait synchroniser des données offline
    // Par exemple, des scores de jeux ou des inscriptions de tournois
  } catch (error) {
    console.error("❌ Erreur de synchronisation:", error);
  }
}
