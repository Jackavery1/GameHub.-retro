
/**
 * 🥽 Système de Rendu AR
 * Moteur de rendu WebXR pour les expériences AR
 */

class ARRenderer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.session = null;
    this.isSupported = false;
    this.initialized = false;
  }

  async init() {
    try {
      // Vérifier le support WebXR
      if ('xr' in navigator) {
        this.isSupported = await navigator.xr.isSessionSupported('immersive-ar');
      }
      
      if (!this.isSupported) {
        throw new Error('WebXR AR non supporté');
      }
      
      // Initialiser Three.js pour AR
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.xr.enabled = true;
      this.renderer.xr.setReferenceSpaceType('local');
      
      this.initialized = true;
      console.log('✅ Système de rendu AR initialisé');
    } catch (error) {
      console.error('Erreur initialisation AR:', error);
      throw error;
    }
  }

  async startSession() {
    if (!this.initialized) {
      throw new Error('AR Renderer non initialisé');
    }
    
    try {
      this.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.getElementById('ar-overlay') }
      });
      
      this.session.addEventListener('end', () => {
        this.session = null;
      });
      
      this.renderer.setAnimationLoop(this.render.bind(this));
      console.log('✅ Session AR démarrée');
    } catch (error) {
      console.error('Erreur démarrage session AR:', error);
      throw error;
    }
  }

  render(time, frame) {
    if (frame) {
      const pose = frame.getViewerPose(this.session.referenceSpace);
      if (pose) {
        const view = pose.views[0];
        this.camera.matrix.fromArray(view.transform.matrix);
        this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);
        this.camera.updateMatrixWorld();
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  addObject(object) {
    if (this.scene) {
      this.scene.add(object);
    }
  }

  removeObject(object) {
    if (this.scene) {
      this.scene.remove(object);
    }
  }

  dispose() {
    if (this.session) {
      this.session.end();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

module.exports = ARRenderer;
