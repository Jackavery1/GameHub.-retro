// Intégration des émulateurs open-source
class EmulatorIntegration {
  constructor() {
    this.currentEmulator = null;
    this.emulatorType = null;
    this.romData = null;
    this.config = {
      useOpenSource: true, // Par défaut, utiliser les émulateurs open-source
      preferredEmulator: "emulatorjs", // emulatorjs, retroarch, custom
      autoSave: true,
      fullscreen: false,
    };
  }

  // Initialiser l'intégration
  async init() {
    console.log("🎮 Initialisation de l'intégration émulateur...");

    // Charger la configuration depuis localStorage
    this.loadConfig();

    // Détecter les capacités du navigateur
    await this.detectCapabilities();

    console.log("✅ Intégration émulateur initialisée");
  }

  // Détecter les capacités du navigateur
  async detectCapabilities() {
    this.capabilities = {
      webAssembly: typeof WebAssembly !== "undefined",
      webGL: !!window.WebGLRenderingContext,
      audioContext: !!window.AudioContext,
      fileSystem: "File" in window,
      indexedDB: "indexedDB" in window,
    };

    console.log("🔍 Capacités détectées:", this.capabilities);
  }

  // Charger un émulateur
  async loadEmulator(type, romPath = null, options = {}) {
    this.emulatorType = type;

    try {
      console.log(`🎮 Chargement de l'émulateur ${type}...`);

      // Déterminer quel émulateur utiliser
      const emulatorChoice = this.selectEmulator(type, options);

      switch (emulatorChoice) {
        case "emulatorjs":
          await this.loadEmulatorJS(type, romPath, options);
          break;
        case "retroarch":
          await this.loadRetroArch(type, romPath, options);
          break;
        case "custom":
          await this.loadCustomEmulator(type, romPath, options);
          break;
        default:
          throw new Error(`Émulateur non supporté: ${emulatorChoice}`);
      }

      console.log(`✅ Émulateur ${type} chargé avec succès`);
      return true;
    } catch (error) {
      console.error(
        `❌ Erreur lors du chargement de l'émulateur ${type}:`,
        error
      );
      throw error;
    }
  }

  // Sélectionner l'émulateur approprié
  selectEmulator(type, options = {}) {
    // Priorité aux émulateurs open-source si activés
    if (this.config.useOpenSource) {
      // EmulatorJS pour la plupart des systèmes
      if (["nes", "snes", "gb", "genesis", "n64", "ps1"].includes(type)) {
        return "emulatorjs";
      }

      // RetroArch pour les systèmes plus complexes
      if (["ps2", "gamecube", "wii"].includes(type)) {
        return "retroarch";
      }
    }

    // Fallback vers les émulateurs personnalisés
    return "custom";
  }

  // Charger EmulatorJS
  async loadEmulatorJS(type, romPath, options = {}) {
    const container = document.getElementById("emulatorContainer");
    if (!container) {
      throw new Error("Container émulateur non trouvé");
    }

    // Configuration EmulatorJS
    const emulatorConfig = {
      system: this.getEmulatorJSSystem(type),
      rom: romPath,
      bios: this.getBiosPath(type),
      ...options,
    };

    // Créer l'iframe EmulatorJS
    const iframe = document.createElement("iframe");
    iframe.id = "emulatorjs-frame";
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";

    // URL EmulatorJS (vous pouvez héberger localement ou utiliser un CDN)
    const emulatorjsUrl = this.buildEmulatorJSUrl(emulatorConfig);
    iframe.src = emulatorjsUrl;

    // Vider le container et ajouter l'iframe
    container.innerHTML = "";
    container.appendChild(iframe);

    this.currentEmulator = {
      type: "emulatorjs",
      iframe: iframe,
      config: emulatorConfig,
    };
  }

  // Charger RetroArch
  async loadRetroArch(type, romPath, options = {}) {
    const container = document.getElementById("emulatorContainer");
    if (!container) {
      throw new Error("Container émulateur non trouvé");
    }

    // Vérifier que WebAssembly est supporté
    if (!this.capabilities.webAssembly) {
      throw new Error("WebAssembly non supporté pour RetroArch");
    }

    // Configuration RetroArch
    const retroArchConfig = {
      core: this.getRetroArchCore(type),
      rom: romPath,
      ...options,
    };

    // Créer le canvas pour RetroArch
    const canvas = document.createElement("canvas");
    canvas.id = "retroarch-canvas";
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.border = "2px solid #333";
    canvas.style.borderRadius = "8px";

    // Vider le container et ajouter le canvas
    container.innerHTML = "";
    container.appendChild(canvas);

    // Charger RetroArch Web
    await this.loadRetroArchWeb(canvas, retroArchConfig);

    this.currentEmulator = {
      type: "retroarch",
      canvas: canvas,
      config: retroArchConfig,
    };
  }

  // Charger l'émulateur personnalisé existant
  async loadCustomEmulator(type, romPath, options = {}) {
    console.log(`🎮 Chargement de l'émulateur personnalisé ${type}...`);

    // Utiliser les émulateurs existants
    switch (type) {
      case "nes":
        if (window.NESEmulator) {
          this.currentEmulator = new window.NESEmulator();
          this.currentEmulator.init();
        }
        break;
      case "snes":
        if (window.SNESEmulator) {
          this.currentEmulator = new window.SNESEmulator();
          this.currentEmulator.init();
        }
        break;
      default:
        throw new Error(`Émulateur personnalisé non disponible: ${type}`);
    }
  }

  // Obtenir la configuration système pour EmulatorJS
  getEmulatorJSSystem(type) {
    const systems = {
      nes: "nes",
      snes: "snes",
      gb: "gb",
      gbc: "gbc",
      gba: "gba",
      genesis: "genesis",
      n64: "n64",
      ps1: "psx",
    };

    return systems[type] || type;
  }

  // Obtenir le core RetroArch approprié
  getRetroArchCore(type) {
    const cores = {
      nes: "fceumm",
      snes: "snes9x",
      gb: "gambatte",
      gbc: "gambatte",
      gba: "mgba",
      genesis: "genesis_plus_gx",
      n64: "parallel_n64",
      ps1: "pcsx_rearmed",
    };

    return cores[type] || "fceumm";
  }

  // Construire l'URL EmulatorJS
  buildEmulatorJSUrl(config) {
    // Vous pouvez héberger EmulatorJS localement ou utiliser un CDN
    const baseUrl = "https://emulatorjs.org/";
    const params = new URLSearchParams({
      system: config.system,
      rom: config.rom || "",
      bios: config.bios || "",
      fullscreen: this.config.fullscreen ? "1" : "0",
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Obtenir le chemin BIOS pour un système
  getBiosPath(type) {
    const biosPaths = {
      ps1: "/bios/ps1/",
      ps2: "/bios/ps2/",
      gamecube: "/bios/gc/",
    };

    return biosPaths[type] || "";
  }

  // Charger RetroArch Web
  async loadRetroArchWeb(canvas, config) {
    // Charger le script RetroArch Web
    const script = document.createElement("script");
    script.src =
      "https://buildbot.libretro.com/stable/1.10.0/emscripten/retroarch.js";

    script.onload = () => {
      // Initialiser RetroArch
      if (window.RetroArch) {
        window.RetroArch.init(canvas, {
          core: config.core,
          rom: config.rom,
          ...config,
        });
      }
    };

    document.head.appendChild(script);
  }

  // Sauvegarder l'état du jeu
  async saveState(slot = 0) {
    if (!this.currentEmulator) {
      throw new Error("Aucun émulateur chargé");
    }

    try {
      let saveData = null;

      switch (this.currentEmulator.type) {
        case "emulatorjs":
          // Sauvegarde via postMessage
          this.currentEmulator.iframe.contentWindow.postMessage(
            {
              type: "saveState",
              slot: slot,
            },
            "*"
          );
          break;

        case "retroarch":
          // Sauvegarde RetroArch
          if (window.RetroArch) {
            saveData = await window.RetroArch.saveState(slot);
          }
          break;

        case "custom":
          // Sauvegarde émulateur personnalisé
          if (this.currentEmulator.saveState) {
            saveData = this.currentEmulator.saveState(slot);
          }
          break;
      }

      // Sauvegarder dans localStorage ou IndexedDB
      if (saveData) {
        await this.persistSaveData(saveData, slot);
      }

      console.log(`💾 État sauvegardé dans le slot ${slot}`);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      throw error;
    }
  }

  // Charger l'état du jeu
  async loadState(slot = 0) {
    if (!this.currentEmulator) {
      throw new Error("Aucun émulateur chargé");
    }

    try {
      let saveData = null;

      // Charger depuis le stockage local
      saveData = await this.loadSaveData(slot);

      if (saveData) {
        switch (this.currentEmulator.type) {
          case "emulatorjs":
            this.currentEmulator.iframe.contentWindow.postMessage(
              {
                type: "loadState",
                slot: slot,
                data: saveData,
              },
              "*"
            );
            break;

          case "retroarch":
            if (window.RetroArch) {
              await window.RetroArch.loadState(slot, saveData);
            }
            break;

          case "custom":
            if (this.currentEmulator.loadState) {
              this.currentEmulator.loadState(slot, saveData);
            }
            break;
        }
      }

      console.log(`📂 État chargé depuis le slot ${slot}`);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors du chargement:", error);
      throw error;
    }
  }

  // Persister les données de sauvegarde
  async persistSaveData(data, slot) {
    const key = `emulator_save_${this.emulatorType}_${slot}`;

    if (this.capabilities.indexedDB) {
      // Utiliser IndexedDB pour les gros fichiers
      await this.saveToIndexedDB(key, data);
    } else {
      // Fallback vers localStorage
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Charger les données de sauvegarde
  async loadSaveData(slot) {
    const key = `emulator_save_${this.emulatorType}_${slot}`;

    if (this.capabilities.indexedDB) {
      return await this.loadFromIndexedDB(key);
    } else {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }

  // Sauvegarder dans IndexedDB
  async saveToIndexedDB(key, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("EmulatorSaves", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["saves"], "readwrite");
        const store = transaction.objectStore("saves");

        const saveRequest = store.put({ key, data, timestamp: Date.now() });
        saveRequest.onsuccess = () => resolve();
        saveRequest.onerror = () => reject(saveRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("saves", { keyPath: "key" });
      };
    });
  }

  // Charger depuis IndexedDB
  async loadFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("EmulatorSaves", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["saves"], "readonly");
        const store = transaction.objectStore("saves");

        const loadRequest = store.get(key);
        loadRequest.onsuccess = () => {
          resolve(loadRequest.result ? loadRequest.result.data : null);
        };
        loadRequest.onerror = () => reject(loadRequest.error);
      };
    });
  }

  // Charger la configuration
  loadConfig() {
    const savedConfig = localStorage.getItem("emulator_config");
    if (savedConfig) {
      this.config = { ...this.config, ...JSON.parse(savedConfig) };
    }
  }

  // Sauvegarder la configuration
  saveConfig() {
    localStorage.setItem("emulator_config", JSON.stringify(this.config));
  }

  // Changer la configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  // Obtenir les informations de l'émulateur actuel
  getEmulatorInfo() {
    if (!this.currentEmulator) {
      return null;
    }

    return {
      type: this.currentEmulator.type,
      system: this.emulatorType,
      config: this.currentEmulator.config,
      capabilities: this.capabilities,
    };
  }

  // Arrêter l'émulateur actuel
  stopEmulator() {
    if (this.currentEmulator) {
      switch (this.currentEmulator.type) {
        case "emulatorjs":
          if (this.currentEmulator.iframe) {
            this.currentEmulator.iframe.remove();
          }
          break;
        case "retroarch":
          if (window.RetroArch) {
            window.RetroArch.shutdown();
          }
          break;
        case "custom":
          if (this.currentEmulator.destroy) {
            this.currentEmulator.destroy();
          }
          break;
      }

      this.currentEmulator = null;
      this.emulatorType = null;
    }
  }
}

// Instance globale
window.EmulatorIntegration = new EmulatorIntegration();

// Initialisation automatique
document.addEventListener("DOMContentLoaded", () => {
  window.EmulatorIntegration.init();
});
