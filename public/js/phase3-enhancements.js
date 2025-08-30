/**
 * PHASE 3: Améliorations et Optimisations Avancées
 * GameHub Retro - Phase 3
 */

class Phase3Enhancements {
  constructor() {
    this.initialized = false;
    this.performanceMetrics = {};
    this.init();
  }

  init() {
    if (this.initialized) return;

    this.setupPerformanceMonitoring();
    this.setupAdvancedAnimations();
    this.setupSmartNotifications();
    this.setupProgressiveEnhancement();

    this.initialized = true;
    console.log("🚀 PHASE 3: Améliorations initialisées");
  }

  // ===== MONITORING DE PERFORMANCE =====
  setupPerformanceMonitoring() {
    // Métriques de performance en temps réel
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "navigation") {
            this.performanceMetrics.pageLoad =
              entry.loadEventEnd - entry.loadEventStart;
            this.performanceMetrics.domContentLoaded =
              entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
          }
        });
      });

      observer.observe({ entryTypes: ["navigation"] });
    }

    // Monitoring des ressources
    this.monitorResourceLoading();
  }

  monitorResourceLoading() {
    const resources = performance.getEntriesByType("resource");
    const slowResources = resources.filter((r) => r.duration > 1000);

    if (slowResources.length > 0) {
      console.warn("⚠️ Ressources lentes détectées:", slowResources);
      this.optimizeResourceLoading();
    }
  }

  optimizeResourceLoading() {
    // Préchargement intelligent des ressources
    const criticalImages = document.querySelectorAll(
      'img[data-critical="true"]'
    );
    criticalImages.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove("lazy");
      }
    });
  }

  // ===== ANIMATIONS AVANCÉES =====
  setupAdvancedAnimations() {
    // Animations basées sur le scroll
    this.setupScrollAnimations();

    // Animations d'interaction
    this.setupInteractionAnimations();

    // Animations de performance
    this.setupPerformanceAnimations();
  }

  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll("[data-scroll-animate]");

    if ("IntersectionObserver" in window) {
      const scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const animation = element.dataset.scrollAnimate || "fadeIn";
              element.classList.add(`animate-${animation}`);
              scrollObserver.unobserve(element);
            }
          });
        },
        { threshold: 0.1 }
      );

      animatedElements.forEach((el) => scrollObserver.observe(el));
    }
  }

  setupInteractionAnimations() {
    // Effets de ripple sur les boutons
    document.addEventListener("click", (e) => {
      if (e.target.matches("button, .btn, .btn-8")) {
        this.createRippleEffect(e);
      }
    });
  }

  createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    button.style.position = "relative";
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  setupPerformanceAnimations() {
    // Animations optimisées pour les performances
    const animatedCards = document.querySelectorAll(
      ".console-card, .game-card, .tournament-card"
    );

    animatedCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.style.willChange = "transform, opacity";
    });
  }

  // ===== NOTIFICATIONS INTELLIGENTES =====
  setupSmartNotifications() {
    if ("Notification" in window && Notification.permission === "granted") {
      this.setupGameNotifications();
      this.setupTournamentNotifications();
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      this.requestNotificationPermission();
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.setupSmartNotifications();
      }
    } catch (error) {
      console.log("Notifications non supportées");
    }
  }

  setupGameNotifications() {
    // Notifications pour les nouveaux jeux
    this.checkForNewGames();
  }

  setupTournamentNotifications() {
    // Notifications pour les tournois
    this.checkForTournamentUpdates();
  }

  checkForNewGames() {
    // Vérification périodique des nouveaux jeux
    setInterval(() => {
      // Logique de vérification des nouveaux jeux
    }, 300000); // 5 minutes
  }

  checkForTournamentUpdates() {
    // Vérification des mises à jour de tournois
    setInterval(() => {
      // Logique de vérification des tournois
    }, 600000); // 10 minutes
  }

  // ===== AMÉLIORATION PROGRESSIVE =====
  setupProgressiveEnhancement() {
    // Vérification des capacités du navigateur
    this.checkBrowserCapabilities();

    // Amélioration conditionnelle
    this.applyConditionalEnhancements();
  }

  checkBrowserCapabilities() {
    const capabilities = {
      webp: this.supportsWebP(),
      webgl: this.supportsWebGL(),
      serviceWorker: "serviceWorker" in navigator,
      pushNotifications: "PushManager" in window,
      backgroundSync: "BackgroundSyncManager" in window,
    };

    this.capabilities = capabilities;
    console.log("🔍 Capacités du navigateur:", capabilities);
  }

  supportsWebP() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  supportsWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && canvas.getContext("webgl"));
    } catch (e) {
      return false;
    }
  }

  applyConditionalEnhancements() {
    // Améliorations basées sur les capacités
    if (this.capabilities.webp) {
      this.optimizeImagesForWebP();
    }

    if (this.capabilities.webgl) {
      this.enableWebGLEffects();
    }

    if (this.capabilities.serviceWorker) {
      this.setupServiceWorker();
    }
  }

  optimizeImagesForWebP() {
    const images = document.querySelectorAll("img[data-webp]");
    images.forEach((img) => {
      if (img.dataset.webp) {
        img.src = img.dataset.webp;
      }
    });
  }

  enableWebGLEffects() {
    // Effets WebGL pour les éléments spéciaux
    const webglElements = document.querySelectorAll("[data-webgl]");
    webglElements.forEach((el) => {
      el.classList.add("webgl-enhanced");
    });
  }

  setupServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker enregistré:", registration);
        })
        .catch((error) => {
          console.log("❌ Erreur Service Worker:", error);
        });
    }
  }

  // ===== MÉTHODES PUBLIQUES =====
  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  getCapabilities() {
    return this.capabilities;
  }

  // Méthode pour optimiser dynamiquement
  optimize() {
    this.monitorResourceLoading();
    this.optimizeResourceLoading();
  }
}

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  window.phase3Enhancements = new Phase3Enhancements();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Phase3Enhancements;
}
