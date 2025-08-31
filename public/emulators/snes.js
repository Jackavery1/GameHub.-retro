class SNESEmulator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.isPaused = false;
    this.currentGame = null;
    this.savedState = null;
    this.audioContext = null;
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  init() {
    this.setupCanvas();
    this.setupAudio();
    this.loadSNES9x();
    this.setupControls();
    this.updateUI();
  }

  setupCanvas() {
    this.canvas = document.getElementById("snesCanvas");
    if (!this.canvas) {
      console.error("Canvas SNES non trouvé");
      return;
    }
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setupAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio non supporté:", e);
    }
  }

  loadSNES9x() {
    // Simulation du chargement de SNES9x.js
    console.log("🎮 Chargement de SNES9x.js...");
    setTimeout(() => {
      this.initializeSNES();
    }, 1000);
  }

  initializeSNES() {
    console.log("✅ SNES9x initialisé");
    this.updateUI();
  }

  loadGame(gameId) {
    console.log(`🎮 Chargement du jeu SNES: ${gameId}`);
    this.currentGame = gameId;

    // Simulation du chargement de ROM
    const romData = this.getROMData(gameId);
    if (romData) {
      this.start();
    }
  }

  getAvailableGames() {
    return [
      { id: "marioworld", name: "Super Mario World", year: 1990 },
      { id: "donkeykong", name: "Donkey Kong Country", year: 1994 },
      { id: "zelda", name: "A Link to the Past", year: 1991 },
      { id: "metroid", name: "Super Metroid", year: 1994 },
      { id: "streetfighter", name: "Street Fighter II", year: 1992 },
      { id: "mariokart", name: "Super Mario Kart", year: 1992 },
    ];
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.lastFrameTime = performance.now();
      this.gameLoop();
      console.log("▶️ Jeu SNES démarré");
    }
  }

  pause() {
    this.isPaused = true;
    console.log("⏸️ Jeu SNES en pause");
  }

  resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    console.log("▶️ Jeu SNES repris");
  }

  reset() {
    this.frameCount = 0;
    this.isPaused = false;
    console.log("🔄 Jeu SNES reset");
  }

  saveState() {
    this.savedState = {
      game: this.currentGame,
      frameCount: this.frameCount,
      timestamp: Date.now(),
    };
    console.log("💾 État sauvegardé");
  }

  loadState() {
    if (this.savedState) {
      this.currentGame = this.savedState.game;
      this.frameCount = this.savedState.frameCount;
      console.log("📂 État chargé");
    }
  }

  setupControls() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    if (!this.isRunning) return;

    switch (e.code) {
      case "ArrowUp":
        this.sendControl("up", true);
        break;
      case "ArrowDown":
        this.sendControl("down", true);
        break;
      case "ArrowLeft":
        this.sendControl("left", true);
        break;
      case "ArrowRight":
        this.sendControl("right", true);
        break;
      case "KeyZ":
        this.sendControl("a", true);
        break;
      case "KeyX":
        this.sendControl("b", true);
        break;
      case "KeyC":
        this.sendControl("x", true);
        break;
      case "KeyV":
        this.sendControl("y", true);
        break;
      case "Enter":
        this.sendControl("start", true);
        break;
      case "Space":
        this.togglePause();
        break;
      case "KeyR":
        this.reset();
        break;
      case "KeyS":
        this.saveState();
        break;
      case "KeyL":
        this.loadState();
        break;
    }
  }

  handleKeyUp(e) {
    if (!this.isRunning) return;

    switch (e.code) {
      case "ArrowUp":
        this.sendControl("up", false);
        break;
      case "ArrowDown":
        this.sendControl("down", false);
        break;
      case "ArrowLeft":
        this.sendControl("left", false);
        break;
      case "ArrowRight":
        this.sendControl("right", false);
        break;
      case "KeyZ":
        this.sendControl("a", false);
        break;
      case "KeyX":
        this.sendControl("b", false);
        break;
      case "KeyC":
        this.sendControl("x", false);
        break;
      case "KeyV":
        this.sendControl("y", false);
        break;
      case "Enter":
        this.sendControl("start", false);
        break;
    }
  }

  sendControl(control, pressed) {
    // Simulation de l'envoi de contrôles à l'émulateur
    if (pressed) {
      console.log(`🎮 Contrôle pressé: ${control}`);
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    if (!this.isPaused && deltaTime >= 16.67) {
      // ~60 FPS
      this.frameCount++;
      this.renderFrame();
      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  renderFrame() {
    if (!this.ctx) return;

    // Simulation du rendu d'une frame SNES
    const colors = [
      "#000000",
      "#FFFFFF",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
    ];
    const color = colors[this.frameCount % colors.length];

    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Affichage du nom du jeu
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `SNES: ${this.currentGame || "Aucun jeu"}`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.fillText(
      `Frame: ${this.frameCount}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 30
    );
  }

  updateUI() {
    // Mise à jour de l'interface utilisateur
    console.log("🎮 Interface SNES mise à jour");
  }

  // Méthodes pour les ROMs simulées
  getROMData(gameId) {
    const roms = {
      marioworld: this.getMarioWorldROM(),
      donkeykong: this.getDonkeyKongROM(),
      zelda: this.getZeldaROM(),
      metroid: this.getMetroidROM(),
      streetfighter: this.getStreetFighterROM(),
      mariokart: this.getMarioKartROM(),
    };
    return roms[gameId];
  }

  getMarioWorldROM() {
    return {
      name: "Super Mario World",
      size: "512KB",
      checksum: "mario_world_1990",
    };
  }

  getDonkeyKongROM() {
    return {
      name: "Donkey Kong Country",
      size: "1MB",
      checksum: "dk_country_1994",
    };
  }

  getZeldaROM() {
    return {
      name: "A Link to the Past",
      size: "1MB",
      checksum: "zelda_altp_1991",
    };
  }

  getMetroidROM() {
    return { name: "Super Metroid", size: "1MB", checksum: "metroid_1994" };
  }

  getStreetFighterROM() {
    return { name: "Street Fighter II", size: "2MB", checksum: "sf2_1992" };
  }

  getMarioKartROM() {
    return {
      name: "Super Mario Kart",
      size: "1MB",
      checksum: "mario_kart_1992",
    };
  }
}

window.SNESEmulator = SNESEmulator;
