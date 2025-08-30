
/**
 * 🎯 Système de Tracking AR
 * Détection des surfaces et calibration automatique
 */

class ARTrackingSystem {
  constructor() {
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;
    this.surfaces = [];
    this.calibrated = false;
  }

  async initHitTest(session, frame, referenceSpace) {
    if (this.hitTestSourceRequested === false) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar');
        this.hitTestSource = await session.requestHitTestSource({ space: referenceSpace });
        this.hitTestSourceRequested = true;
        console.log('✅ Hit test source initialisé');
      } catch (error) {
        console.error('Erreur hit test:', error);
        throw error;
      }
    }
  }

  async detectSurfaces(frame) {
    if (this.hitTestSource && frame) {
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(this.referenceSpace);
        
        if (pose) {
          const surface = {
            position: pose.transform.position,
            orientation: pose.transform.orientation,
            timestamp: Date.now()
          };
          
          this.surfaces.push(surface);
          return surface;
        }
      }
    }
    return null;
  }

  async calibrate() {
    try {
      // Calibration automatique basée sur la détection de surfaces
      if (this.surfaces.length >= 3) {
        this.calibrated = true;
        console.log('✅ Calibration AR terminée');
        return true;
      } else {
        console.log('⏳ Calibration en cours...');
        return false;
      }
    } catch (error) {
      console.error('Erreur calibration:', error);
      throw error;
    }
  }

  getTrackingQuality() {
    if (!this.calibrated) return 0;
    
    const recentSurfaces = this.surfaces.slice(-10);
    const consistency = this.calculateConsistency(recentSurfaces);
    
    if (consistency > 0.8) return 'excellent';
    if (consistency > 0.6) return 'good';
    if (consistency > 0.4) return 'fair';
    return 'poor';
  }

  calculateConsistency(surfaces) {
    if (surfaces.length < 2) return 0;
    
    // Calculer la cohérence des positions détectées
    const positions = surfaces.map(s => s.position);
    const variance = this.calculateVariance(positions);
    
    return Math.max(0, 1 - variance);
  }

  calculateVariance(positions) {
    const mean = positions.reduce((acc, pos) => {
      return {
        x: acc.x + pos.x,
        y: acc.y + pos.y,
        z: acc.z + pos.z
      };
    }, { x: 0, y: 0, z: 0 });
    
    mean.x /= positions.length;
    mean.y /= positions.length;
    mean.z /= positions.length;
    
    const variance = positions.reduce((acc, pos) => {
      return acc + Math.pow(pos.x - mean.x, 2) + 
                   Math.pow(pos.y - mean.y, 2) + 
                   Math.pow(pos.z - mean.z, 2);
    }, 0) / positions.length;
    
    return variance;
  }
}

module.exports = ARTrackingSystem;
