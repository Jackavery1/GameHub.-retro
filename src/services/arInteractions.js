/**
 * 👆 Système d'Interactions AR
 * Contrôles gestuels et interactions tactiles
 */

class ARInteractionSystem {
  constructor() {
    this.gestures = new Map();
    this.touchPoints = [];
    this.isTracking = false;
    this.callbacks = new Map();
  }

  init() {
    this.setupGestureRecognition();
    this.setupTouchTracking();
    console.log("✅ Système d'interactions AR initialisé");
  }

  setupGestureRecognition() {
    // Définir les gestes reconnus
    this.gestures.set("swipe-left", { minDistance: 50, maxTime: 500 });
    this.gestures.set("swipe-right", { minDistance: 50, maxTime: 500 });
    this.gestures.set("swipe-up", { minDistance: 50, maxTime: 500 });
    this.gestures.set("swipe-down", { minDistance: 50, maxTime: 500 });
    this.gestures.set("pinch", { minScale: 0.8, maxScale: 1.2 });
    this.gestures.set("tap", { maxDistance: 10, maxTime: 300 });
  }

  setupTouchTracking() {
    let startX, startY, startTime;
    let currentScale = 1;

    document.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      } else if (e.touches.length === 2) {
        const distance = this.getDistance(e.touches[0], e.touches[1]);
        currentScale = distance;
      }
    });

    document.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        const deltaTime = Date.now() - startTime;

        this.detectGesture(deltaX, deltaY, deltaTime);
      } else if (e.touches.length === 2) {
        const distance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = distance / currentScale;

        if (scale < 0.8) {
          this.triggerGesture("pinch-in");
        } else if (scale > 1.2) {
          this.triggerGesture("pinch-out");
        }
      }
    });

    document.addEventListener("touchend", (e) => {
      const deltaTime = Date.now() - startTime;
      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < 10 && deltaTime < 300) {
        this.triggerGesture("tap");
      }
    });
  }

  detectGesture(deltaX, deltaY, deltaTime) {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 50 && deltaTime < 500) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.triggerGesture("swipe-right");
        } else {
          this.triggerGesture("swipe-left");
        }
      } else {
        if (deltaY > 0) {
          this.triggerGesture("swipe-down");
        } else {
          this.triggerGesture("swipe-up");
        }
      }
    }
  }

  getDistance(touch1, touch2) {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  triggerGesture(gesture) {
    console.log("🎯 Geste détecté:", gesture);

    if (this.callbacks.has(gesture)) {
      this.callbacks.get(gesture)();
    }
  }

  onGesture(gesture, callback) {
    this.callbacks.set(gesture, callback);
  }

  provideHapticFeedback(intensity = 0.5) {
    if ("vibrate" in navigator) {
      navigator.vibrate(intensity * 100);
    }
  }
}

module.exports = ARInteractionSystem;
